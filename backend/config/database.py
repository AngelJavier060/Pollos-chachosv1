from typing import Dict, Any

class DatabaseConfig:
    def __init__(self, provider: str = "supabase"):
        self.provider = provider
        self.connections = {
            "supabase": {
                "table_name": "database-build-8p0tx0q2wyg11r76",
                "schema": "public"
            },
            "postgresql": {
                "table_name": "pollos_chanchos",
                "schema": "public"
            },
            "mysql": {
                "table_name": "pollos_chanchos",
                "database": "pollos_db"
            }
        }

    def get_table_name(self) -> str:
        return self.connections[self.provider]["table_name"]

    def get_config(self) -> Dict[str, Any]:
        return self.connections[self.provider]
