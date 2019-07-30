import * as React from "react";
import * as ReactDOM from "react-dom";

ReactDOM.render(
  <div>Hello React</div>,
  document.getElementById("app")
);


const myBtn:HTMLElement | null = document.getElementById("my-btn")
if (myBtn) {
  myBtn.addEventListener("click", e => {
    console.log("click!");
  });
}
