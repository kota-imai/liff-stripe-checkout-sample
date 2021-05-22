const liffId = "XXXXXXXXXXXXXXXXX"; // LIFF ID

var stripe;
var checkoutSessionId;

window.addEventListener('DOMContentLoaded', (event) => {
  liff.init({
    liffId: liffId
  })
    .then(() => {
      if (!liff.isInClient() && !liff.isLoggedIn()) {
        window.alert("LINEアカウントにログインしてください。");
        liff.login({ redirectUri: location.href });
      }
      const idToken = liff.getIDToken();
      return idToken;
    })
    .then((idToken) => {
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
            token: idToken,
            liffid: liffId
          }),
        }).then(function (response) {
          return response.json();
        });
      };

      setupElements();
      createCheckoutSession(false);

      document.querySelectorAll(".donation").forEach(function (donationBtn) {
        donationBtn.addEventListener("click", function (evt) {
          if (evt.target.classList.contains("selected")) {
            evt.target.classList.remove("selected");
          } else {
            document.querySelectorAll(".donation").forEach(function (el) {
              el.classList.remove("selected");
            });
            evt.target.classList.add("selected");
          }
        });
      });

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
    .catch((err) => {
      console.log('LIFFアプリの初期化に失敗しました', err);
    });
});