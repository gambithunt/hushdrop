#!/usr/bin/env python3
"""
Local Whisper transcription service
Provides a simple interface to OpenAI's Whisper for local audio transcription
"""

import sys
import json
import argparse
import tempfile
import os
from pathlib import Path

try:
    import whisper
    import torch
except ImportError:
    print(json.dumps({
        "error": "Whisper dependencies not installed. Run: pip install openai-whisper torch"
    }))
    sys.exit(1)

def transcribe_audio(audio_path, model_name="base", language=None):
    """
    Transcribe audio file using Whisper
    
    Args:
        audio_path: Path to audio file
        model_name: Whisper model to use (tiny, base, small, medium, large)
        language: Language code (optional, auto-detect if None)
    
    Returns:
        Dictionary with transcription results
    """
    try:
        # Load model
        model = whisper.load_model(model_name)
        
        # Transcribe
        result = model.transcribe(
            audio_path,
            language=language,
            fp16=torch.cuda.is_available()  # Use FP16 if CUDA available
        )
        
        return {
            "success": True,
            "transcript": result["text"].strip(),
            "language": result["language"],
            "duration": result.get("duration", 0),
            "segments": result.get("segments", []),
            "model": model_name
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "model": model_name
        }

def main():
    parser = argparse.ArgumentParser(description="Local Whisper transcription service")
    parser.add_argument("audio_file", help="Path to audio file")
    parser.add_argument("--model", default="base", 
                       choices=["tiny", "base", "small", "medium", "large"],
                       help="Whisper model to use")
    parser.add_argument("--language", help="Language code (optional)")
    parser.add_argument("--output", help="Output JSON file (optional)")
    
    args = parser.parse_args()
    
    # Check if audio file exists
    if not os.path.exists(args.audio_file):
        result = {
            "success": False,
            "error": f"Audio file not found: {args.audio_file}"
        }
    else:
        result = transcribe_audio(args.audio_file, args.model, args.language)
    
    # Output result
    json_output = json.dumps(result, indent=2)
    
    if args.output:
        with open(args.output, 'w') as f:
            f.write(json_output)
    else:
        print(json_output)

if __name__ == "__main__":
    main()