import subprocess
import time
import re
import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

DIRECTORY = os.path.dirname(os.path.abspath(__file__))
URL_FILE = os.path.join(DIRECTORY, "public_url.txt")

def start_persistent_tunnel():
    cmd = [
        "ssh",
        "-o", "StrictHostKeyChecking=no",
        "-o", "ServerAliveInterval=15",
        "-o", "ServerAliveCountMax=6",
        "-R", "80:127.0.0.1:3000",
        "nokey@localhost.run"
    ]

    while True:
        try:
            print("[Tunnel] Establishing public SSH tunnel...")
            sys.stdout.flush()
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding='utf-8',
                errors='replace'
            )

            current_url = None
            for line in proc.stdout:
                # Look for https://*.lhr.life pattern
                match = re.search(r'(https://[a-zA-Z0-9\.\-]+\.lhr\.life)', line)
                if match:
                    current_url = match.group(1)
                    print(f"==================================================")
                    print(f"🚀 ACTIVE PUBLIC TUNNEL: {current_url}")
                    print(f"==================================================")
                    sys.stdout.flush()
                    try:
                        with open(URL_FILE, "w", encoding="utf-8") as f:
                            f.write(current_url)
                    except Exception as e:
                        pass
                
            proc.wait()
            print("[Tunnel] Tunnel connection closed. Auto-reconnecting in 3 seconds...")
            sys.stdout.flush()
            time.sleep(3)
        except Exception as e:
            print(f"[Tunnel Error] {e}. Reconnecting in 5 seconds...")
            sys.stdout.flush()
            time.sleep(5)

if __name__ == "__main__":
    start_persistent_tunnel()
