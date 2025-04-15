from http.server import HTTPServer, SimpleHTTPRequestHandler
import time
import mimetypes

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        
        # Add cache control headers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        
        super().end_headers()

    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.end_headers()

    def guess_type(self, path):
        # Ensure .js files are served with correct MIME type
        if path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.css'):
            return 'text/css'
        return super().guess_type(path)

server = HTTPServer(('', 8888), NoCacheHandler)
print('Serving on port 8888...')
print('CORS enabled, JavaScript MIME types fixed')
server.serve_forever()
