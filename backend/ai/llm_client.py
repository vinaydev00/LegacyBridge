# This file talks to Groq AI
# Same concept as your RAG project but for COBOL translation

import os
from groq import Groq
from dotenv import load_dotenv
from prompt_builder import PromptBuilder

load_dotenv()

class LLMClient:
    def __init__(self):
        # Connect to Groq
        self.client = Groq(
            api_key=os.getenv("GROQ_API_KEY")
        )
        self.prompt_builder = PromptBuilder()
        # Free and fast model
        self.model = "llama-3.3-70b-versatile"

    def understand_cobol(self, parsed_data, extracted_data):
        print("🤖 AI is reading the COBOL...")

        prompt = self.prompt_builder.build_understanding_prompt(
            parsed_data, extracted_data
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        understanding = response.choices[0].message.content
        print("✅ AI understood the COBOL!")
        print("\n--- AI UNDERSTANDING ---")
        print(understanding)
        return understanding

    def generate_api_code(self, program_name, understanding, variables):
        print("\n🤖 AI is generating Python API...")

        prompt = self.prompt_builder.build_api_generation_prompt(
            program_name, understanding, variables
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        api_code = response.choices[0].message.content
        print("✅ AI generated the API!")
        return api_code

    def calculate_confidence(self, understanding, api_code):
        print("\n🤖 Calculating confidence score...")

        prompt = f"""Based on this COBOL understanding:
{understanding}

And this generated API:
{api_code[:300]}

Rate your confidence in this translation from 0-100.
Respond with ONLY a number. Nothing else."""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        try:
            score = int(response.choices[0].message.content.strip())
            return min(max(score, 0), 100)
        except:
            return 75

# TEST IT
if __name__ == "__main__":
    import sys
    sys.path.append("../parser")
    from cobol_parser import COBOLParser
    from extractor import COBOLExtractor

    # Parse the COBOL file
    parser = COBOLParser("C:\\Users\\hp\\LegacyBridge\\sample_cobol\\tax_calculator.cbl")
    parsed = parser.parse()

    # Extract variables
    extractor = COBOLExtractor(parsed["divisions"])
    extracted = extractor.extract_all()

    # Ask AI to understand it
    client = LLMClient()
    understanding = client.understand_cobol(parsed, extracted)

    # Ask AI to generate Python API
    api_code = client.generate_api_code(
        parsed["program_name"],
        understanding,
        extracted["variables"]
    )

    print("\n--- GENERATED PYTHON API ---")
    print(api_code)