// Static comments
// modified version of: https://github.com/travisdowns/travisdowns.github.io/blob/master/assets/main.js
const addComment = (() => {
  const select = (s) => {
    return document.querySelector(s);
  };

  const getElemById = (id) => {
    return document.getElementById(id);
  };

  const submitButton = select(".submit-form");

  const form = select(".form");
  form.doReset = () => {
    submitButton.innerHTML = "Submit";
    this.classList.remove("disabled");
    this.disabled = false;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const errorHandler = (title, err) => {
      const ecode = err.errorCode || "unknown";
      showModal(title, "An error occured.\n\n[" + ecode + "]", false);
    };

    const captchaString = getElemById("captcha-label")
      .innerHTML.toString()
      .replaceAll(" ", "")
      .slice(0, 5);

    const ans = eval(captchaString);
    const userAns = getElemById("commentbox-captcha").value;

    if (ans != userAns) {
      errorHandler("Wrong Captcha!", { errorCode: "CAPTCHA_INCORRECT" });
      generateCaptcha();
      getElemById("commentbox-captcha").value = "";
      return;
    }

    submitButton.innerHTML = "Posting...";
    submitButton.classList.add("disabled");
    submitButton.disabled = true;

    fetch(this.getAttribute("action"), {
      method: "POST",
      body: new URLSearchParams(new FormData(this)),
      headers: new Headers({
        "content-type": "application/x-www-form-urlencoded",
      }),
    })
      .then(function (data) {
        if (data.ok) {
          showModal(
            "Comment submitted!",
            "Thanks for your comment! It will be published after it's been approved by the Genics Blog team :)",
            true
          );
        } else {
          data.json().then(function (err) {
            errorHandler("Server Error", err);
            generateCaptcha();
          });
        }
      })
      .catch((err) => {
        errorHandler("Unexpected Error", err);
      });
  });

  const showModal = (title, message, reset) => {
    getElemById("modal").classList.remove("hidden");

    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-message").textContent = message;

    select("#close").addEventListener("click", () => {
      getElemById("modal").classList.add("hidden");

      submitButton.innerHTML = "Submit";
      submitButton.classList.remove("disabled");
      submitButton.disabled = false;

      if (reset) {
        form.reset();
        form.doReset();
      }
    });
  };

  // Staticman comment replies, from https://github.com/mmistakes/made-mistakes-jekyll
  // modified from Wordpress https://core.svn.wordpress.org/trunk/wp-includes/js/comment-reply.js
  // Released under the GNU General Public License - https://wordpress.org/about/gpl/
  // addComment.moveForm is called from comment.html when the reply link is clicked.

  return {
    // commId - the id attribute of the comment replied to (e.g., "comment-10")
    // respondId - the string "respond", I guess
    // parentId - the UID of the parent comment
    moveForm: (commId, respondId, parentId) => {
      const t = this;
      const comm = getElemById(commId); // whole comment
      const respond = getElemById(respondId); // whole new comment form
      const cancel = getElemById("cancel-reply-btn"); // whole reply cancel link
      const parentIdF = getElemById("replying-to-id"); // a hidden element in the comment

      if (!comm || !respond || !cancel || !parentIdF) {
        return;
      }

      t.respondId = respondId;

      if (!getElemById("sm-temp-form-div")) {
        const div = document.createElement("div");
        div.id = "sm-temp-form-div";
        div.style.display = "none";
        respond.parentNode.insertBefore(div, respond); // create and insert a bookmark div right before comment form
      }

      comm.parentNode.insertBefore(respond, comm.nextSibling); // move the form from the bottom to above the next sibling
      parentIdF.value = parentId;
      getElemById("form-parent").classList.add("ml-14");
      getElemById("form-title").innerHTML = "Add a reply";
      cancel.classList.remove("hidden"); // make the cancel link visible

      cancel.onclick = () => {
        const temp = getElemById("sm-temp-form-div"); // temp is the original bookmark
        const respond = getElemById(t.respondId); // respond is the comment form

        if (!temp || !respond) {
          return;
        }

        getElemById("form-parent").classList.remove("ml-14");
        getElemById("form-title").innerHTML = "Add a comment";
        getElemById("replying-to-id").value = null;
        temp.parentNode.insertBefore(respond, temp); // move the comment form to its original location
        temp.parentNode.removeChild(temp); // remove the bookmark div
        this.classList.add("hidden"); // make the cancel link invisible
        this.onclick = null; // retire the onclick handler
        return false;
      };

      getElemById("commentbox-name").focus();

      return false;
    },
  };
})();
