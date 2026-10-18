const questions = [
    {
        q: "Which dinosaur was a herbivore?",
        options: ["T. rex", "Triceratops", "Velociraptor"],
        answer: "Triceratops",
    },
    {
        q: "Which dinosaur had a long neck?",
        options: ["Brachiosaurus", "Stegosaurus", "Spinosaurus"],
        answer: "Brachiosaurus",
    },
];

quiz.innerHTML = questions
    .map(
        (x, i) => `
  <p>${x.q}</p>
  ${x.options
      .map(
          (o) => `
    <label><input type="radio" name="q${i}" value="${o}"> ${o}</label>
  `,
      )
      .join("")}
`,
    )
    .join("");

function check() {
    let score = 0;

    questions.forEach((x, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected?.value === x.answer) score++;
    });

    result.textContent = `${score} / ${questions.length} correct`;
}
