import os
import torch
from datasets import load_dataset
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, BitsAndBytesConfig
from trl import SFTTrainer

# === Configuration ===
MODEL_NAME = "deepseek-ai/deepseek-coder-6.7b-base" # Example base model
NEW_MODEL_NAME = "deepseek-coder-antigravity-lora"
DATASET_FILE = "dataset.jsonl" # Created by Antigravity

# === ROCm Optimization ===
# Ensure PyTorch sees the AMD GPU
print(f"CUDA (ROCm) Available: {torch.cuda.is_available()}")
device = "cuda" if torch.cuda.is_available() else "cpu"

def train():
    # 1. Load Tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # 2. Load Model (Quantized for VRAM efficiency if needed)
    # Note: bitsandbytes support on ROCm can be tricky. 
    # If 4bit fails, remove quantization_config and load in 16bit.
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float16,
        device_map="auto",
        trust_remote_code=True
    )

    # 3. LoRA Configuration
    peft_config = LoraConfig(
        lora_alpha=16,
        lora_dropout=0.1,
        r=64,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
    )

    # 4. Load Dataset
    dataset = load_dataset("json", data_files=DATASET_FILE, split="train")

    # 5. Training Arguments
    training_args = TrainingArguments(
        output_dir="./results",
        num_train_epochs=1,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        optim="paged_adamw_32bit",
        save_steps=25,
        logging_steps=25,
        learning_rate=2e-4,
        weight_decay=0.001,
        fp16=True, # Enable mixed precision for ROCm
        bf16=False, # ROCm often prefers fp16 over bf16 on older cards
        max_grad_norm=0.3,
        max_steps=-1,
        warmup_ratio=0.03,
        group_by_length=True,
        lr_scheduler_type="constant",
        report_to="tensorboard"
    )

    # 6. Initialize Trainer
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        peft_config=peft_config,
        dataset_text_field="text",
        max_seq_length=None,
        tokenizer=tokenizer,
        args=training_args,
        packing=False,
    )

    # 7. Start Training
    print("Starting Training...")
    trainer.train()
    
    # 8. Save Model
    trainer.model.save_pretrained(NEW_MODEL_NAME)
    print(f"Model saved to {NEW_MODEL_NAME}")

if __name__ == "__main__":
    train()
