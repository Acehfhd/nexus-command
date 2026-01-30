
from nicegui import ui
import os

# 🌌 NEXUS PRIME CONSOLE (Bootloader)

@ui.page('/')
def index():
    with ui.column().classes('w-full h-screen items-center justify-center bg-gray-900 text-white'):
        ui.label('🌌').classes('text-9xl animate-pulse')
        ui.label('NEXUS PRIME SYSTEM').classes('text-4xl font-bold mt-4')
        ui.label('Initializing Cockpit...').classes('text-xl opacity-70')
        
        # Hardware Status Placeholder
        with ui.row().classes('mt-8 gap-4'):
            with ui.card().classes('bg-gray-800 p-4'):
                ui.label('BRAIN').classes('text-xs font-bold text-gray-400')
                ui.label('ONLINE').classes('text-green-400')
            with ui.card().classes('bg-gray-800 p-4'):
                ui.label('GRID').classes('text-xs font-bold text-gray-400')
                ui.label('CONNECTED').classes('text-green-400')

ui.run(port=8080, title='Nexus Prime')
