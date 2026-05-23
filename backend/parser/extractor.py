import re

class COBOLExtractor:
    def __init__(self, divisions):
        self.divisions = divisions

    def extract_variables(self):
        variables = []
        data_section = self.divisions.get("data", "")
        pattern = r'(\d{2})\s+([A-Z0-9\-]+)\s+PIC\s+([^\n\.]+)'
        matches = re.findall(pattern, data_section.upper())

        for match in matches:
            level, name, pic_type = match
            if '9' in pic_type:
                python_type = "float" if 'V' in pic_type else "int"
            elif 'X' in pic_type:
                python_type = "str"
            else:
                python_type = "str"

            variables.append({
                "name": name.strip(),
                "cobol_type": pic_type.strip(),
                "python_type": python_type,
                "level": level
            })

        print(f"✅ Found {len(variables)} variables")
        return variables

    def extract_operations(self):
        procedure = self.divisions.get("procedure", "").upper()
        operations = []

        if "COMPUTE" in procedure:
            operations.append("mathematical_calculation")
        if "IF" in procedure or "EVALUATE" in procedure:
            operations.append("conditional_logic")
        if "ACCEPT" in procedure:
            operations.append("accepts_input")
        if "DISPLAY" in procedure:
            operations.append("produces_output")
        if "READ" in procedure or "WRITE" in procedure:
            operations.append("file_operations")
        if "PERFORM" in procedure:
            operations.append("loops_or_subroutines")
        if "MOVE" in procedure:
            operations.append("data_assignment")

        print(f"✅ Found operations: {operations}")
        return operations

    def extract_all(self):
        return {
            "variables": self.extract_variables(),
            "operations": self.extract_operations()
        }

# TEST IT
if __name__ == "__main__":
    from cobol_parser import COBOLParser
    parser = COBOLParser("C:\\Users\\hp\\LegacyBridge\\sample_cobol\\tax_calculator.cbl")
    parsed = parser.parse()
    extractor = COBOLExtractor(parsed["divisions"])
    result = extractor.extract_all()
    print("\n--- VARIABLES FOUND ---")
    for var in result["variables"]:
        print(f"  {var['name']} → Python type: {var['python_type']}")
    print("\n--- OPERATIONS FOUND ---")
    for op in result["operations"]:
        print(f"  {op}")