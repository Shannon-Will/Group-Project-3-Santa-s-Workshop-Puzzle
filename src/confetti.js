export function launchConfetti() {
  for (let i = 0; i < 120; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.background =
      ["red", "green", "gold"][Math.floor(Math.random() * 3)];
    confetti.style.animationDuration = 2 + Math.random() * 3 + "s";
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 5000);
  }
}
