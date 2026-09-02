# Local MCP server (stdio only)

Exposes `read_file`, `grep`, and `list_files` over one workspace root. Do not host this.

```bash
cd mcp-server
npm install
MCP_ROOT=/path/to/workspace npx ts-node src/index.ts
```

Wire it as a local stdio MCP client (Cursor/Claude Desktop). Tools cannot see files outside `MCP_ROOT`; path traversal is rejected. Write/push/delete tools are not included.
