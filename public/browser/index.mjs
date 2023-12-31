class ReviewCard extends HTMLElement {
  #getCounterText(value) {
    return ` (${value})`;
  }

  #vote(voteType) {
    const requestBody = {
      tutorId: this.tutorId,
      userId: this.userId,
      action: voteType,
      reviewId: this.reviewId,
    };

    return fetch(`/${this.tutorId}`, {
      method: "PATCH",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then(async (result) => {
        if (!result.ok) {
          const errorMessage = await result.text();
          return Promise.reject(new Error(errorMessage));
        }

        return await result.json();
      })
      .then((json) => {
        this.thumbsDownCounter.innerText = `(${json?.against ?? 0})`;
        this.thumbsUpCounter.innerText = `(${json?.favor ?? 0})`;
      });
  }

  constructor() {
    super();
    this.counter = 0;

    const shadow = this.attachShadow({ mode: "open" });

    const createElement = (elementType) => document.createElement(elementType);

    // style
    this.cssStyleSheet = createElement("link");
    this.cssStyleSheet.setAttribute("rel", "stylesheet");
    this.cssStyleSheet.setAttribute("href", "/enhance-styles.css");
    this.styleTag = createElement("style");
    this.styleTag.textContent = `
      .reviewCardBorderColor  {
        border-color: var(--grey-100);
      }
    `;

    this.userId = "";
    this.tutorId = "";
    this.reviewId = "";

    // ui elements
    const cardWrapper = createElement("div");
    this.reviewComment = createElement("div");
    this.date = createElement("div");
    const buttonsWrapper = createElement("div");
    const thumbsUpButton = createElement("button");
    this.thumbsUpCounter = createElement("span");
    const thumbsDownButton = createElement("button");
    this.thumbsDownCounter = createElement("span");

    thumbsUpButton.innerText = "👍";
    thumbsDownButton.innerText = "👎";
    this.reviewComment.innerText = "review Comment";
    this.thumbsUpCounter.innerText = this.#getCounterText(0);
    this.thumbsDownCounter.innerText = this.#getCounterText(0);

    thumbsUpButton.appendChild(this.thumbsUpCounter);
    thumbsDownButton.appendChild(this.thumbsDownCounter);

    thumbsUpButton.addEventListener("click", () => {
      if (!this.userId || !this.tutorId) return;
      this.#vote("review-favor");
    });

    thumbsDownButton.addEventListener("click", () => {
      this.#vote("review-against");
    });

    shadow.appendChild(this.cssStyleSheet);
    shadow.appendChild(this.styleTag);
    buttonsWrapper.appendChild(thumbsUpButton);
    buttonsWrapper.appendChild(thumbsDownButton);
    cardWrapper.classList.add(
      "radius1",
      "border1",
      "border-solid",
      "reviewCardBorderColor",
      "p1"
    );
    this.date.classList.add("text-end", "text-1", "mb-1");
    buttonsWrapper.classList.add("mbs1-lg", "flex", "justify-content-around");

    cardWrapper.appendChild(this.reviewComment);
    cardWrapper.appendChild(this.date);
    cardWrapper.appendChild(buttonsWrapper);
    shadow.appendChild(cardWrapper);
  }

  static get observedAttributes() {
    return [
      "thumbs-up",
      "message",
      "thumbs-down",
      "user-id",
      "date-iso-string",
      "tutor-id",
      "user-id",
      "review-id",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      switch (name) {
        case "message":
          this.reviewComment.textContent = newValue;
          break;
        case "thumbs-up":
          this.thumbsUpCounter.textContent = this.#getCounterText(newValue);
          break;
        case "thumbs-down":
          this.thumbsDownCounter.textContent = this.#getCounterText(newValue);
          break;
        case "user-id":
          this.userId = newValue;
          break;
        case "tutor-id":
          this.tutorId = newValue;
          break;
        case "review-id":
          this.reviewId = newValue;
          break;
        case "date-iso-string": {
          const date = new Date(newValue);

          const formatedDate = new Intl.DateTimeFormat("es").format(date);
          this.date.textContent = formatedDate;
          break;
        }
        default:
          return null;
      }
    }
  }
}

customElements.define("review-card", ReviewCard);
