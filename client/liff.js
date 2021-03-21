const liffId = "XXXXXXXXXXXXXXXXX"; // LIFF ID

window.addEventListener('DOMContentLoaded', (event) => {
    liff.init({
        liffId: liffId
    })
    .then(() => {
        if (!liff.isInClient() && !liff.isLoggedIn()) {
            window.alert("LINEアカウントにログインしてください。");
            liff.login({ redirectUri: location.href });
        }
        sessionStorage.setItem('idToken', liff.getIDToken());
    })
    .catch((err) => {
        console.log('LIFF Initialization failed ', err);
    });
});