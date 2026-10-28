# Place Piper voice model files here
#
# Each voice consists of two files:
#   <voice_id>.onnx   — the neural voice model
#   <voice_id>.json   — the voice configuration
#
# Example:
#   en_US-amy-medium.onnx
#   en_US-amy-medium.json
#
# Download voices from:
#   https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/amy/medium
#
# The filename convention is:
#   <lang>_<country>-<name>-<quality>.onnx
#
# The backend automatically scans this directory and lists every .onnx file
# (with its matching .json) as an available voice.
