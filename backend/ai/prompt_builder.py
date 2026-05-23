# This file builds perfect instructions for the AI
# Like writing a detailed brief for an employee

class PromptBuilder:
    def build_understanding_prompt(self, parsed_data, extracted_data):
        program_name = parsed_data["program_name"]
        procedure = parsed_data["divisions"]["procedure"]
        variables = extracted_data["variables"]
        operations = extracted_data["operations"]

        var_list = "\n".join([
            f"  - {v['name']}: {v['cobol_type']} (Python type: {v['python_type']})"
            for v in variables
        ])

        prompt = f"""You are an expert COBOL developer and Python architect.

I have a COBOL program called '{program_name}'.

VARIABLES:
{var_list}

OPERATIONS:
{', '.join(operations)}

ACTUAL COBOL CODE:
{procedure}

Please explain:
1. What does this program do? (1-2 sentences)
2. What inputs does it need?
3. What does it output?
4. What is the business purpose?

Be very specific and concise."""

        return prompt

    def build_api_generation_prompt(self, program_name, understanding, variables):
        var_list = "\n".join([
            f"  {v['name'].lower()}: {v['python_type']}"
            for v in variables if v['level'] == '01'
        ])

        prompt = f"""You are an expert Python developer.

Based on this COBOL program understanding:
{understanding}

Program name: {program_name}
Input variables:
{var_list}

Write a complete FastAPI endpoint that replicates this COBOL program.

Requirements:
1. Use FastAPI with Pydantic models
2. Include input validation
3. Add comments explaining each part
4. Handle edge cases
5. Return JSON response

Output ONLY the Python code. No explanation. No markdown backticks. Just pure Python code."""

        return prompt