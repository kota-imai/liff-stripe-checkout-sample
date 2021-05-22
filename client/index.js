const liffId = "XXXXXXXXXXXXXXXX"; // LIFF ID

var lineIdToken;


// Initialize LIFF app
liff.init({
  liffId: liffId
})
  .then(() => {
    if (!liff.isInClient() && !liff.isLoggedIn()) {
      window.alert("LINEアカウントにログインしてください。");
      liff.login({ redirectUri: location.href });
    }
    lineIdToken = liff.getIDToken();
  })
  .catch((err) => {
    console.log('LIFFアプリの初期化に失敗しました', err);
  });


// After LIFF init
liff.ready.then(() => {
  var stripe;
  var setupElements = function () {
    fetch("/publishable-key", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(function (result) {
        return result.json();
      })
      .then(function (data) {
        stripe = Stripe(data.publishableKey);
      });
  };

  var createCheckoutSession = function (donation) {
    return fetch("/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        donation: donation * 100,
        token: lineIdToken,
        liffid: liffId
      }),
    }).then(function (response) {
      return response.json();
    });
  };

  setupElements();
  createCheckoutSession(false);

  document.querySelector("#submit").addEventListener("click", function (evt) {
    evt.preventDefault();
    // Initiate payment
    var donation = document.querySelector('.donation.selected');
    var donationAmount = donation ? donation.dataset.amount : 0;
    createCheckoutSession(donationAmount).then(function (response) {
      stripe
        .redirectToCheckout({
          sessionId: response.checkoutSessionId,
        })
        .then(function (result) {
          console.log("error");
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  });
})