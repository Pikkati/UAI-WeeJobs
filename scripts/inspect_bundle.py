import sys, binascii
p = r"d:\MyProjectsUAI\weejobs\android\tmp_apk_extracted\assets\index.android.bundle"
try:
    with open(p, 'rb') as f:
        data = f.read()
except Exception as e:
    print('ERROR opening file:', e)
    sys.exit(2)

keywords = [b'No routes found', b'metroEmptyContext', b'require.context', b'Hermes', b'HBC', b'hermes', b'__r', b'metroRequire']
for k in keywords:
    print(k.decode('utf-8', errors='ignore') + ':', 'FOUND' if k in data else 'not found')

print('\nfirst 64 bytes hex:')
print(binascii.hexlify(data[:64]))
print('\nfile size:', len(data))

# try gzip detect
if len(data) >= 2 and data[0] == 0x1f and data[1] == 0x8b:
    print('gzip detected')
# zlib (78 9c or 78 01)
if len(data) >= 2 and data[0] == 0x78:
    print('possible zlib/deflate (78..) detected, bytes:', hex(data[1]))

# check for ascii printable sequences
import re
s = re.findall(b"[ -~]{4,}", data[:100000])
print('\nfirst printable sequences (up to 10):')
for t in s[:10]:
    try:
        print(t.decode('utf-8'))
    except:
        print(t)
