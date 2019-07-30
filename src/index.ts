

const myBtn:HTMLElement | null = document.getElementById("my-btn")
if (myBtn) {
  myBtn.addEventListener("click", e => {
    console.log("click!");
  });
}
