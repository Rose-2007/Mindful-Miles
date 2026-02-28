const form = document.getElementById("travelForm");
const resultDiv = document.getElementById("result");

// Mock responses for development / fallback
const mockResponses = [
  "Destination: Calm Hill Town\nReason: Perfect for mental reset\nActivities: Walk in forest, journal, stargazing\nDuration: 2 days",
  "Destination: Cozy Beach Village\nReason: Refreshes mind\nActivities: Swim, sunset photography, café hopping\nDuration: 3 days",
  "Destination: Art Retreat City\nReason: Creative reset\nActivities: Museum, painting workshop, street art walk\nDuration: 2 days"
];

// Toggle: true = development (mock), false = demo (API)
const useMock = true;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Read form inputs
  const mood = document.getElementById("mood").value.toLowerCase();
  const energy = document.querySelector('input[name="energy"]:checked').value;
  const travelType = document.getElementById("travelType").value;

  // Apply mood-based background & button color
  document.body.className = mood;
  form.querySelector("button").className = mood;

  // BEST Prompt for AI
  const prompt = `
User feels ${mood}, has ${energy} energy, and wants to travel ${travelType}.

Generate a short, clear, fun travel plan including:
1. Destination (city/town/place type)
2. Reason why it suits the user's mood
3. Three suggested activities
4. Ideal trip duration in days

Format like this:
Destination: [Place]
Reason: [Why it matches the mood]
Activities: [Activity 1, Activity 2, Activity 3]
Duration: [X days]

Make it creative, positive, and concise.
`;

  resultDiv.innerHTML = `<p style="color:#fff;">Generating plan...</p>`;

  if (useMock) {
    // ✅ Use mock response for dev / offline
    const aiText = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    resultDiv.innerHTML = `<div class="card"><pre>${aiText}</pre></div>`;
  } else {
    // 🚀 Use Hugging Face API for demo
    try {
      const response = await fetch("https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-125M", {
        method: "POST",
        headers: {
          "Authorization": "Bearer YOUR_HUGGINGFACE_TOKEN",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 80 } })
      });

      const data = await response.json();

      if (!data || !data[0] || !data[0].generated_text) throw new Error("API error");

      let aiText = data[0].generated_text;

      // Optional: Post-process for bullets
      let lines = aiText.split("\n").map(line => line.trim()).filter(line => line);
      let displayText = lines.join("\n• ");

      resultDiv.innerHTML = `<div class="card"><pre>• ${displayText}</pre></div>`;

    } catch (err) {
      console.log("API failed, fallback to mock:", err.message);
      const aiText = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      resultDiv.innerHTML = `<div class="card"><pre>${aiText}</pre></div>`;
    }
  }
});
const slidesContainer = document.querySelector(".slides");
const images = document.querySelectorAll(".slides img");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const dotsContainer = document.querySelector(".dots");

let index = 0;
const total = images.length;

/* Create dots */
images.forEach((_, i) => {
  const dot = document.createElement("span");
  dot.addEventListener("click", () => moveToSlide(i));
  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll(".dots span");

function updateSlider() {
  slidesContainer.style.transform = `translateX(-${index * 100}%)`;

  images.forEach(img => img.classList.remove("active"));
  images[index].classList.add("active");

  dots.forEach(dot => dot.classList.remove("active-dot"));
  dots[index].classList.add("active-dot");
}

function moveToSlide(i) {
  index = i;
  updateSlider();
}

nextBtn.addEventListener("click", () => {
  index = (index + 1) % total;
  updateSlider();
});

prevBtn.addEventListener("click", () => {
  index = (index - 1 + total) % total;
  updateSlider();
});

/* Auto slide */
setInterval(() => {
  index = (index + 1) % total;
  updateSlider();
}, 4000);

updateSlider();
/* =========================
   MOOD BASED BACKGROUND MUSIC
   ========================= */

const bgMusic = document.getElementById("bgMusic");

const moodSongs = {
  overwhelmed: "music/overwhelmed.mpeg",
  excited: "music/excited.mpeg",
  stuck: "music/stuck.mpeg"
};

let currentMoodPlaying = null;

/* Smooth fade out */
function fadeOut(audio) {
  return new Promise(resolve => {
    let fade = setInterval(() => {
      if (audio.volume > 0.05) {
        audio.volume -= 0.05;
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fade);
        resolve();
      }
    }, 50);
  });
}

/* Smooth fade in */
function fadeIn(audio) {
  audio.volume = 0;
  audio.play().catch(() => {}); // prevents autoplay errors
  let fade = setInterval(() => {
    if (audio.volume < 0.95) {
      audio.volume += 0.05;
    } else {
      audio.volume = 1;
      clearInterval(fade);
    }
  }, 50);
}

/* Play mood music smoothly */
async function playMoodMusic(mood) {
  if (currentMoodPlaying === mood) return;

  document.body.classList.add("music-transition");

  if (!bgMusic.paused) {
    await fadeOut(bgMusic);
  }

  bgMusic.src = moodSongs[mood];
  currentMoodPlaying = mood;

  fadeIn(bgMusic);

  setTimeout(() => {
    document.body.classList.remove("music-transition");
  }, 1000);
}

/* Trigger music when mood changes */
document.getElementById("mood").addEventListener("change", function () {
  const selectedMood = this.value.toLowerCase();
  playMoodMusic(selectedMood);
});