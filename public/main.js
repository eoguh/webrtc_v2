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
    audio: false,
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
        socket.emit('create or join message ', roomNumber)
        divSelectRoom.style = 'display: none'
        divConsultingRoom.style = 'display: block'
    }
}

socket.on('created ', room => {
    navigator.mediaDevices.getUserMedia(streamConstraints)
        .then(stream => {
            localStream = stream
            localVideo.srcObject = stream
            isCaller = true
        })
        .catch(err => {
            console.log('An error occured while getting user media. the error is: ', err )
        })

})

