# This file reads a COBOL file and breaks it into 4 parts
# Think of it like splitting a book into chapters

import re

class COBOLParser:
    def __init__(self, file_path):
        # Store the file path
        self.file_path = file_path
        # This will hold the raw text of the file
        self.raw_content = ""
        # This will hold the broken-down pieces
        self.divisions = {
            "identification": "",
            "environment": "",
            "data": "",
            "procedure": ""
        }

    def read_file(self):
        # Open and read the COBOL file
        with open(self.file_path, 'r', encoding='utf-8') as f:
            self.raw_content = f.read()
        print(f"✅ File read successfully: {len(self.raw_content)} characters")
        return self.raw_content

    def extract_divisions(self):
        # Convert to uppercase because COBOL is case-insensitive
        content = self.raw_content.upper()

        # Find where each division starts
        id_match = re.search(r'IDENTIFICATION DIVISION', content)
        env_match = re.search(r'ENVIRONMENT DIVISION', content)
        data_match = re.search(r'DATA DIVISION', content)
        proc_match = re.search(r'PROCEDURE DIVISION', content)

        # Extract text between divisions
        if id_match and env_match:
            self.divisions["identification"] = self.raw_content[id_match.start():env_match.start()].strip()
        elif id_match and data_match:
            self.divisions["identification"] = self.raw_content[id_match.start():data_match.start()].strip()

        if env_match and data_match:
            self.divisions["environment"] = self.raw_content[env_match.start():data_match.start()].strip()

        if data_match and proc_match:
            self.divisions["data"] = self.raw_content[data_match.start():proc_match.start()].strip()

        if proc_match:
            self.divisions["procedure"] = self.raw_content[proc_match.start():].strip()

        print("✅ Divisions extracted successfully")
        return self.divisions

    def get_program_name(self):
        # Extract just the program name
        match = re.search(r'PROGRAM-ID\.\s+(\S+)', self.raw_content.upper())
        if match:
            return match.group(1).replace('.', '')
        return "UNKNOWN-PROGRAM"

    def parse(self):
        # This runs everything in one go
        self.read_file()
        self.extract_divisions()
        return {
            "program_name": self.get_program_name(),
            "divisions": self.divisions,
            "raw": self.raw_content
        }
    # TEST IT — run this file directly to see if it works
if __name__ == "__main__":
    parser = COBOLParser("C:\\Users\\hp\\LegacyBridge\\sample_cobol\\tax_calculator.cbl")
    result = parser.parse()
    print("\n--- PROGRAM NAME ---")
    print(result["program_name"])
    print("\n--- DATA DIVISION ---")
    print(result["divisions"]["data"])
    print("\n--- PROCEDURE DIVISION ---")
    print(result["divisions"]["procedure"])