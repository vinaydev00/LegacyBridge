# This is the main conductor
# It runs all pieces in order:
# COBOL file → Parse → Extract → AI Understands → AI Generates API

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'parser'))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ai'))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'generator'))

from parser.cobol_parser import COBOLParser
from parser.extractor import COBOLExtractor
from ai.llm_client import LLMClient
from ai.prompt_builder import PromptBuilder

class LegacyBridgePipeline:
    def __init__(self):
        self.llm_client = LLMClient()

    def run(self, cobol_file_path):
        print(f"\n🚀 Starting LegacyBridge Pipeline")
        print(f"📄 File: {cobol_file_path}")
        print("=" * 60)

        # STEP 1: Parse COBOL
        print("\n📖 STEP 1: Reading COBOL file...")
        parser = COBOLParser(cobol_file_path)
        parsed_data = parser.parse()
        program_name = parsed_data["program_name"]
        print(f"   Program: {program_name}")

        # STEP 2: Extract variables and operations
        print("\n🔍 STEP 2: Extracting variables and operations...")
        extractor = COBOLExtractor(parsed_data["divisions"])
        extracted_data = extractor.extract_all()

        # STEP 3: AI understands COBOL
        print("\n🤖 STEP 3: AI reading and understanding COBOL...")
        understanding = self.llm_client.understand_cobol(parsed_data, extracted_data)

        # STEP 4: AI generates Python API
        print("\n⚡ STEP 4: AI generating Python API...")
        api_code = self.llm_client.generate_api_code(
            program_name,
            understanding,
            extracted_data["variables"]
        )

        # STEP 5: Calculate confidence
        print("\n📊 STEP 5: Calculating confidence score...")
        confidence = self.llm_client.calculate_confidence(understanding, api_code)
        print(f"   Confidence: {confidence}%")

        # STEP 6: Save generated API
        print("\n💾 STEP 6: Saving generated API...")
        os.makedirs("generated_apis", exist_ok=True)
        filename = f"{program_name.lower().replace('-', '_')}_api.py"
        filepath = os.path.join("generated_apis", filename)
        with open(filepath, 'w') as f:
            f.write(api_code)
        print(f"   Saved to: {filepath}")

        result = {
            "program_name": program_name,
            "understanding": understanding,
            "generated_code": api_code,
            "confidence_score": confidence,
            "api_file": filepath
        }

        print("\n" + "=" * 60)
        print("✅ PIPELINE COMPLETE!")
        print(f"   Program: {program_name}")
        print(f"   Confidence: {confidence}%")
        print(f"   Saved: {filepath}")

        return result


# RUN THIS TO TEST EVERYTHING
if __name__ == "__main__":
    pipeline = LegacyBridgePipeline()
    result = pipeline.run("C:\\Users\\hp\\LegacyBridge\\sample_cobol\\tax_calculator.cbl")

    print("\n\n--- GENERATED PYTHON API ---")
    print(result["generated_code"])