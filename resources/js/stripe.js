import axios from "axios";
import Noty from "noty";
import { loadStripe } from "@stripe/stripe-js";

import { placeOrder } from "./apiService";

export async function initStripe() {
  //Stripe load
  const stripe = await loadStripe(
    "pk_test_51JAH5MSJQQR3TnHr96T2ZacIQwnIZqPVMbNXVIDRnhT2RUDUoz1r24MoVY18iTjqaS0acXs2MqDqXOxGetZ9x3Qg00WOqOlQlH"
  );
  let card = null;
  function mountWidget() {
    let style = {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4"
        }
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a"
      }
    };

    const element = stripe.elements();

    card = element.create("card", { style, hidePostalCode: true });
    card.mount("#card-element");
  }

  //On change the payment type
  let paymentType = document.querySelector("#paymentType");
  if (!paymentType) {
    return;
  }

  paymentType.addEventListener("change", (e) => {
    if (e.target.value == "card") {
      mountWidget();
    } else {
      card.destroy();
    }
  });

  //Submit the form using ajax for order
  const paymentForm = document.querySelector("#payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      let formData = new FormData(paymentForm);
      let formObject = {};
      for (let [key, value] of formData.entries()) {
        formObject[key] = value;
      }

      if (!card) {
        // Ajax
        placeOrder(formObject);
        return;
      }

      //   const token = await card.createToken();
      //   formObject.stripeToken = token.id;
      //   placeOrder(formObject);

      // Verify card
      stripe
        .createToken(card)
        .then((result) => {
          formObject.stripeToken = result.token.id;
          placeOrder(formObject);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
}
