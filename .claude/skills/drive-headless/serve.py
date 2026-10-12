"""serve.py: static server for the repo root that sends Cache-Control: no-store, so Chrome never
shows a stale styles.css / main.js after an edit. Binds every interface, so a phone on the same
Wi-Fi can open it too.

Usage, from the repo root:  python3 .claude/skills/drive-headless/serve.py [port] [dir]
"""
import functools
import http.server
import socket
import sys

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
root = sys.argv[2] if len(sys.argv) > 2 else "."


class NoStore(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass  # quiet; errors still raise


def lan_ip():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))
            return s.getsockname()[0]
    except OSError:
        return None


ip = lan_ip()
print(f"http://localhost:{port}/designbycc-landing/index.html")
if ip:
    print(f"http://{ip}:{port}/designbycc-landing/index.html  (phone, same Wi-Fi)")
class Server(http.server.ThreadingHTTPServer):
    # The default listen backlog is 5: a page that fetches more files at once
    # (deferred scripts, preloaded fonts) got some connections dropped, so
    # scripts failed at random (seen 2026-10-12: GSAP "not defined").
    request_queue_size = 128
    daemon_threads = True


Server(("0.0.0.0", port), functools.partial(NoStore, directory=root)).serve_forever()
