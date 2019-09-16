import frida, sys

def on_message(message, data):
    if message['type'] == 'send':
        print("[*] {0}".format(message['payload']))
    else:
        print(message)

def run(pkg):
    jscode = open('Fridademo.js','r',encoding= 'utf8').read()
    process = frida.get_usb_device().attach(pkg)
    script = process.create_script(jscode)
    script.on('message', on_message)
    script.load()
    sys.stdin.read()

def main(argv):
    if len(argv) != 2:
        print("must input two arg")
        print("For example: python demo.py packName")
        # run("cn.kxgz.fridademo")
    else:
        run(argv[1])

if __name__ == "__main__":
    main(sys.argv)