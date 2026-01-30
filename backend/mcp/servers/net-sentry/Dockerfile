FROM kalilinux/kali-rolling

# Update and install essential network tools
RUN apt-get update && \
    apt-get dist-upgrade -y && \
    apt-get install -y \
    nmap \
    python3 \
    python3-pip \
    python3-scapy \
    net-tools \
    iproute2 \
    whois \
    bind9-dnsutils \
    iputils-ping \
    nikto \
    # Remove dangerous tools to prevent disk accidents
    && apt-get remove -y \
    cryptsetup \
    fdisk \
    parted \
    gparted \
    dosfstools \
    ntfs-3g \
    && apt-get autoremove -y \
    # Clean up to keep image small
    && rm -rf /var/lib/apt/lists/*

# Set up workspace
WORKDIR /app

# Copy the scanner script
COPY sentry_mcp.py /app/sentry_mcp.py
COPY TOOLS_AND_RULES.md /app/TOOLS_AND_RULES.md

# Entry point
ENTRYPOINT ["python3", "/app/sentry_mcp.py"]
