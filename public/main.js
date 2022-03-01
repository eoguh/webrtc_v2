let divSelectRoom = document.getElementById("selectRoom")
let divConsultingRoom = document.getElementById("consultingRoom")
let inputRoomNumber = document.getElementById("roomNumber")
let btnGoRoom = document.getElementById("goRoom")
let localVideo = document.getElementById("localVideo")
let remoteVideo = document.getElementById("remoteVideo")


let roomNumber, localStream, remoteStream, rtcPeerConnection, isCaller

const iceServers = {
    'iceServer': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'}
    ]
}

const streamConstraints = {
    audio: true,
    video: true,
}

const socket = io()

btnGoRoom.onclick = () => {
    if(inputRoomNumber.value === '') {
        alert("please input a room number")
    }else {
        // navigator.mediaDevices.getUserMedia(streamConstraints)
        //     .then(stream => {
        //         localStream = stream
        //         localVideo.srcObject = stream
        //     })
        //     .catch(err => {
        //         console.log('An error occured while getting user media. the error is: ', err )
        //     })
        roomNumber = inputRoomNumber.value
        socket.emit('create or join', roomNumber)
        divSelectRoom.style = "display: none"
        divConsultingRoom.style = "display: block"
    }
}

socket.on('created', room => {
    navigator.mediaDevices.getUserMedia(streamConstraints)
            .then(stream => {
                localStream = stream
                localVideo.srcObject = stream
                isCaller = true
            })
            .catch(err => {
                console.log('An error occured while getting user media.', err)
            })

})

socket.on('joined', room => {
    navigator.mediaDevices.getUserMedia(streamConstraints)
            .then(stream => {
                localStream = stream
                localVideo.srcObject = stream
                socket.emit('ready', roomNumber)
            })
            .catch(err => {
                console.log('An error occured while getting user media.', err)
            })

})

socket.on('ready', () => {
    if(isCaller){
        rtcPeerConnection = new RTCPeerConnection(iceServers)
        rtcPeerConnection.onicecandidate = onIceCandidate
        rtcPeerConnection.onTrack = onAddStream
        rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream)
        rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream)
        rtcPeerConnection.createOffer()
            .then(sessionDiscription => {
                rtcPeerConnection.setLocalDiscription(sessionDiscription)
                socket.emit('offer', {
                    type: 'offer',
                    sdp: sessionDiscription,
                    room: roomNumber
                })
            })
            .catch(err => {
                console.log(err)
            })
    }
})


socket.on('offer', (event) => {
    if(!isCaller){
        rtcPeerConnection = new RTCPeerConnection(iceServers)
        rtcPeerConnection.onicecandidate = onIceCandidate
        rtcPeerConnection.onTrack = onAddStream
        rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream)
        rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream)
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
        rtcPeerConnection.createAnswer()
            .then(sessionDiscription => {
                rtcPeerConnection.setLocalDiscription(sessionDiscription)
                socket.emit('answer', {
                    type: 'answer',
                    sdp: sessionDiscription,
                    room: roomNumber
                })
            })
            .catch(err => {
                console.log(err)
            })
    }
})

socket.on('answer', event => {
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
})

socket.on('candidate', event => {
    const candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate
    })
    rtcPeerConnection.addIceCandidate(candidate)
})

function onAddStream(event){
    remoteVideo.srcObject = event.stream[0]
    remoteStream = event.stream[0]
}

function onIceCandidate(event){
    if(event.candidate){
        console.log("sending ice candidate", event.candidate)
        socket.emit('candidate', {
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
            room: roomNumber,
        })
    }
}


