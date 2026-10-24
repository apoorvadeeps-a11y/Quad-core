"""OneStep Qwen Training & Fine-Tuning Pipeline.

Converts real-world website interactive elements and user goals into:
1. Qwen ChatML training dataset (Alpaca / ShareGPT format).
2. Customized Ollama Modelfile (`onestep-qwen`) tailored for web element extraction.
"""

import json
from pathlib import Path
import os
import subprocess
import sys

BACKEND_DIR = Path(__file__).resolve().parent
DATASET_FILE = BACKEND_DIR / "training_data.jsonl"
OUTPUT_DATASET = BACKEND_DIR / "qwen_train_dataset.json"
MODELFILE_PATH = BACKEND_DIR / "Modelfile"

BASE_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:0.5b")


def export_chatml_dataset() -> list[dict]:
    """Convert scraped website sessions into Qwen 2.5 ChatML fine-tuning dataset."""
    if not DATASET_FILE.exists():
        print(f"[!] No training data found at {DATASET_FILE}")
        return []

    samples = []
    with open(DATASET_FILE, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                data = json.loads(line)
                goal = data.get("goal", "")
                page = data.get("page", "")
                elements = data.get("elements", [])
                selected_id = data.get("selected_element_id")
                instruction = data.get("instruction", "")
                reason = data.get("reason", "")

                if not goal or not elements:
                    continue

                user_prompt = f"Goal: {goal}\nPage: {page}\nElements: {json.dumps(elements, ensure_ascii=False)}"
                assistant_response = json.dumps({
                    "element_id": selected_id,
                    "instruction": instruction,
                    "reason": reason
                }, ensure_ascii=False)

                chatml_entry = {
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are OneStep, an AI website navigation assistant. "
                                "Analyze the user's goal, page, and interactive elements, "
                                "and return JSON with 'element_id', 'instruction', and 'reason'."
                            )
                        },
                        {"role": "user", "content": user_prompt},
                        {"role": "assistant", "content": assistant_response}
                    ]
                }
                samples.append(chatml_entry)
            except Exception as e:
                print(f"Skipping malformed line: {e}")

    with open(OUTPUT_DATASET, "w", encoding="utf-8") as out:
        json.dump(samples, out, indent=2, ensure_ascii=False)

    print(f"[+] Exported {len(samples)} training pairs to {OUTPUT_DATASET}")
    return samples


def generate_ollama_modelfile():
    """Create an Ollama Modelfile tailored with website element extraction instructions."""
    modelfile_content = f"""FROM {BASE_MODEL}

SYSTEM \"\"\"You are OneStep, an expert AI website navigation assistant.
Your job is to analyze any website's interactive elements and the user's goal, then select the exact element ID from the page to interact with.

CRITICAL RULES:
1. You MUST select an element_id ONLY from the provided list of elements.
2. If none of the elements are relevant to the user's goal, return "element_id": null.
3. NEVER invent or hallucinate an element ID.
4. Output JSON ONLY with keys "element_id", "instruction", and "reason".
\"\"\"

PARAMETER temperature 0.1
PARAMETER top_p 0.9
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"
"""
    with open(MODELFILE_PATH, "w", encoding="utf-8") as f:
        f.write(modelfile_content)

    print(f"[+] Created custom Modelfile at {MODELFILE_PATH}")


def build_custom_ollama_model(model_name: str = "onestep-qwen"):
    """Build the custom OneStep Qwen model inside local Ollama."""
    generate_ollama_modelfile()
    print(f"[*] Building custom Ollama model '{model_name}'...")
    try:
        res = subprocess.run(
            ["ollama", "create", model_name, "-f", str(MODELFILE_PATH)],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"[+] Successfully built '{model_name}'!")
        print(res.stdout)
        return True
    except Exception as e:
        print(f"[!] Could not run 'ollama create': {e}")
        return False


if __name__ == "__main__":
    print("==================================================")
    print("OneStep Qwen Website Training Pipeline")
    print("==================================================")
    export_chatml_dataset()
    build_custom_ollama_model("onestep-qwen")
