# GoAsk - MCP Interactive Tool

A desktop application built with Go and Wails that implements the Model Context Protocol (MCP) for interactive user communication. This tool allows AI assistants to ask questions and receive responses from users through a clean, modern desktop interface.

## Features

- 🤖 **MCP Server Integration** - Implements Model Context Protocol for AI assistant communication
- 💬 **Interactive Q&A** - Provides `ask_question` and `one_more_thing` tools for AI assistants
- 🖥️ **Cross-Platform** - Runs on Windows, macOS, and Linux
- 🎨 **Modern UI** - Clean, responsive interface built with HTML/CSS/JavaScript
- 🔄 **Real-time Communication** - Instant communication between AI and user
- 📷 **Image Support** - Supports image responses in addition to text
- 🚀 **Lightweight** - Fast startup and minimal resource usage

## Prerequisites

- **Go** 1.23 or later
- **Node.js** 16+ and npm
- **Wails CLI** v2.10.1 or later

### Platform-specific Requirements

#### Windows
- WebView2 runtime (usually pre-installed on Windows 10/11)

#### macOS
- macOS 10.13 or later

#### Linux
- GTK3 development libraries
- WebKit2GTK development libraries

## Installation

### Option 1: Download Pre-built Binaries

Download the latest release for your platform from the [Releases](https://github.com/xysele/goask/releases) page.

### Option 2: Build from Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/xysele/goask.git
   cd goask
   ```

2. **Install Wails CLI** (if not already installed)
   ```bash
   go install github.com/wailsapp/wails/v2/cmd/wails@latest
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Build the application**
   ```bash
   wails build
   ```

The built application will be available in the `build/bin` directory.

## Usage

### MCP Configuration

To use this tool with an AI assistant that supports MCP, configure it as follows:

```json
{
  "mcpServers": {
    "goask": {
      "command": "path/to/goask",
      "args": []
    }
  }
}
```

## Development

### Development Setup

1. **Clone and setup**
   ```bash
   git clone https://github.com/xysele/goask.git
   cd goask
   wails doctor  # Check if all dependencies are installed
   ```

2. **Run in development mode**
   ```bash
   wails dev
   ```

This will start the application with hot reload enabled for both frontend and backend changes.

### Project Structure

```
goask/
├── app.go              # Main application logic
├── main.go             # Entry point and MCP server setup
├── go.mod              # Go module dependencies
├── wails.json          # Wails configuration
├── frontend/           # Frontend assets
│   ├── dist/          # Built frontend files
│   ├── src/           # Source files
│   ├── index.html     # Main HTML file
│   └── package.json   # Frontend dependencies
└── build/             # Build outputs and assets
    ├── bin/           # Compiled binaries
    ├── darwin/        # macOS specific files
    └── windows/       # Windows specific files
```

### Building for Different Platforms

#### Windows
```bash
wails build -platform windows/amd64
```

#### macOS
```bash
wails build -platform darwin/amd64
wails build -platform darwin/arm64
```

#### Linux
```bash
wails build -platform linux/amd64
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Go best practices and conventions
- Ensure cross-platform compatibility
- Add tests for new functionality
- Update documentation as needed
- Use meaningful commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Wails](https://wails.io/) - For the excellent Go + Web framework
- [MCP-Go](https://github.com/mark3labs/mcp-go) - For the Model Context Protocol implementation
- [Model Context Protocol](https://modelcontextprotocol.io/) - For the protocol specification

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/xysele/goask/issues) page
2. Create a new issue with detailed information
3. Include your operating system and version information