self.addEventListener("install",()=>{
    console.log("Service Worker installed")
});


self.addEventListener("activate",()=>{
    console.log("service worker activated")
})