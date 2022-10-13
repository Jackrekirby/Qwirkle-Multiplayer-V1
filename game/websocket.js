

function initWebSocket() {
    const ws = new WebSocket('ws://localhost:7071/ws');;

    {
        const ref = document.getElementById('submitName');
        ref.onclick = () => {
            ws.send(JSON.stringify(
            ));
        }
    }

    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        console.log(data);
    };
}
