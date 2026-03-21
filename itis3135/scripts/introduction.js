document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("intro-form");

  // Prevents page refresh / default behavior
  form.addEventListener("submit", (e) => e.preventDefault());

  // Validation: prevent submission if any required field is empty
  form.addEventListener("submit", function () {
    const requiredFields = Array.from(
      form.querySelectorAll("input[required], textarea[required]"),
    );
    let allValid = true;

    requiredFields.forEach(function (field) {
      if (field.value.trim() === "") {
        field.style.outline = "2px solid red";
        allValid = false;
      } else {
        field.style.outline = "";
      }
    });

    if (!allValid) {
      alert("Please fill out all required fields before submitting.");
      return;
    }

    generateIntro();
  });

  // Generate intro: gather form data and replace the form with the intro page content
  function generateIntro() {
    const firstName = document.getElementById("first-name").value.trim();
    const middleName = document.getElementById("middle-name").value.trim();
    const nickname = document.getElementById("nickname").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const mascotAdj = document.getElementById("mascot-adj").value.trim();
    const mascotAnimal = document.getElementById("mascot-animal").value.trim();
    const divider = document.getElementById("divider").value.trim();
    const pictureFile = document.getElementById("picture").files[0];
    const pictureCaption = document
      .getElementById("picture-caption")
      .value.trim();
    const personalStatement = document
      .getElementById("personal-statement")
      .value.trim();
    const personalBg = document.getElementById("personal-bg").value.trim();
    const professionalBg = document
      .getElementById("professional-bg")
      .value.trim();
    const academicBg = document.getElementById("academic-bg").value.trim();
    const subjectBg = document.getElementById("subject-bg").value.trim();
    const primaryComputer = document
      .getElementById("primary-computer")
      .value.trim();
    const backupComputer = document
      .getElementById("backup-computer")
      .value.trim();
    const quote = document.getElementById("quote").value.trim();
    const quoteAuthor = document.getElementById("quote-author").value.trim();
    const funnyThing = document.getElementById("funny-thing").value.trim();
    const share = document.getElementById("share").value.trim();

    // Gather courses by reading inputs within each .course-entry fieldset
    const courseEntries = Array.from(
      document.querySelectorAll(".course-entry"),
    );
    const courses = courseEntries
      .map(function (entry) {
        const inputs = entry.querySelectorAll("input");
        const textarea = entry.querySelector("textarea");
        return {
          dept: inputs[0] ? inputs[0].value.trim() : "",
          num: inputs[1] ? inputs[1].value.trim() : "",
          name: inputs[2] ? inputs[2].value.trim() : "",
          reason: textarea ? textarea.value.trim() : "",
        };
      })
      .filter(function (c) {
        return c.dept || c.num || c.name;
      });

    // Gather links
    const links = [];
    for (let i = 1; i <= 5; i++) {
      const label = document.getElementById("link" + i + "-label").value.trim();
      const url = document.getElementById("link" + i + "-url").value.trim();
      if (label && url) links.push({ label: label, url: url });
    }

    // Build the full name and heading (nickname shown in parentheses if provided)
    const nameParts = [firstName, middleName, lastName]
      .filter(Boolean)
      .join(" ");
    const displayName = nickname
      ? nameParts + " (" + nickname + ")"
      : nameParts;
    const heading =
      displayName + " " + divider + " " + mascotAdj + " " + mascotAnimal;

    // Build courses list HTML
    const coursesHTML = courses
      .map(function (c) {
        return (
          "<li><b>" +
          c.dept +
          " " +
          c.num +
          " - " +
          c.name +
          ":</b> " +
          c.reason +
          "</li>"
        );
      })
      .join("\n            ");

    // Build the intro HTML
    function buildHTML(imgSrc) {
      return (
        "<h2>Introduction Form</h2>\n" +
        "<h1>" +
        heading +
        "</h1>\n" +
        "<figure>\n" +
        '  <img src="' +
        imgSrc +
        '" alt="' +
        displayName +
        '" width="300" />\n' +
        "  <figcaption>" +
        pictureCaption +
        "</figcaption>\n" +
        "</figure>\n" +
        "<p>" +
        personalStatement +
        "</p>\n" +
        "<ul>\n" +
        "  <li><b>Personal Background:</b> " +
        personalBg +
        "</li>\n" +
        "  <li><b>Professional Background:</b> " +
        professionalBg +
        "</li>\n" +
        "  <li><b>Academic Background:</b> " +
        academicBg +
        "</li>\n" +
        "  <li><b>Background in Subject:</b> " +
        subjectBg +
        "</li>\n" +
        "  <li><b>Primary Work Computer &amp; Location:</b> " +
        primaryComputer +
        "</li>\n" +
        "  <li><b>Backup Work Computer &amp; Location Plan:</b> " +
        backupComputer +
        "</li>\n" +
        "  <li>\n" +
        "    <b>Current Courses:</b>\n" +
        "    <ol>\n" +
        "      " +
        coursesHTML +
        "\n" +
        "    </ol>\n" +
        "  </li>\n" +
        (funnyThing
          ? "  <li><b>Fun Thing About Me:</b> " + funnyThing + "</li>\n"
          : "") +
        (share
          ? "  <li><b>I'd also like to share:</b> " + share + "</li>\n"
          : "") +
        "</ul>\n" +
        "<blockquote>\n" +
        "  &ldquo;" +
        quote +
        "&rdquo; <br /><cite>- " +
        quoteAuthor +
        "</cite>\n" +
        "</blockquote>"
      );
    }

    const main = document.querySelector("main");

    function renderIntro(imgSrc) {
      document.querySelector('link[rel="stylesheet"]').href =
        "../styles/default.css";
      document.title = displayName + " | Introduction";
      main.innerHTML = buildHTML(imgSrc);

      Promise.all([
        fetch("../components/header.html").then(function (r) {
          return r.text();
        }),
        fetch("../components/footer.html").then(function (r) {
          return r.text();
        }),
      ]).then(function (results) {
        document.querySelector("header").outerHTML = results[0];

        // Fix relative links in the injected header
        document.querySelectorAll("header a[href]").forEach(function (a) {
          var href = a.getAttribute("href");
          if (
            href &&
            !href.startsWith("http") &&
            !href.startsWith("#") &&
            !href.startsWith("/")
          ) {
            a.setAttribute("href", "../" + href);
          }
        });

        document.querySelector("footer").outerHTML = results[1];

        // Update footer nav with visitor's submitted links
        if (links.length > 0) {
          const footerNav = document.querySelector("footer nav");
          if (footerNav) {
            footerNav.innerHTML = links
              .map(function (l) {
                return '<a href="' + l.url + '">' + l.label + "</a>";
              })
              .join("\n    |\n    ");
          }
        }

        // Append reset link to footer
        const resetLink = document.createElement("a");
        resetLink.href = "#";
        resetLink.textContent = "Reset / Start Over";
        resetLink.addEventListener("click", function (e) {
          e.preventDefault();
          location.reload();
        });
        document.querySelector("footer").appendChild(resetLink);
      });
    }

    if (pictureFile) {
      const reader = new FileReader();
      reader.onload = function (e) {
        renderIntro(e.target.result);
      };
      reader.readAsDataURL(pictureFile);
    } else {
      renderIntro("images/Me.jpg");
    }
  }

  // Reset: native button reset handles form values; clearing any validation outlines
  document
    .querySelector("button[type='reset']")
    .addEventListener("click", function () {
      Array.from(form.querySelectorAll("input, textarea")).forEach(
        function (field) {
          field.style.outline = "";
        },
      );
    });

  // Add Course:append a new course fieldset
  let courseCount = document.querySelectorAll(
    "#intro-form .course-entry",
  ).length;

  function addCourse() {
    courseCount++;
    const coursesContainer = document.querySelector(
      "#intro-form fieldset:has(#add-course)",
    );
    const newCourse = document.createElement("fieldset");
    newCourse.classList.add("course-entry");
    newCourse.innerHTML =
      "<legend>Course " +
      courseCount +
      "</legend>" +
      '<label for="course' +
      courseCount +
      '-dept">Department:</label>' +
      '<input type="text" id="course' +
      courseCount +
      '-dept" name="course' +
      courseCount +
      '-dept" placeholder="e.g. ITIS" />' +
      '<label for="course' +
      courseCount +
      '-num">Course Number:</label>' +
      '<input type="text" id="course' +
      courseCount +
      '-num" name="course' +
      courseCount +
      '-num" placeholder="e.g. 3135" />' +
      '<label for="course' +
      courseCount +
      '-name">Course Name:</label>' +
      '<input type="text" id="course' +
      courseCount +
      '-name" name="course' +
      courseCount +
      '-name" />' +
      '<label for="course' +
      courseCount +
      '-reason">Reason:</label>' +
      '<textarea id="course' +
      courseCount +
      '-reason" name="course' +
      courseCount +
      '-reason"></textarea>';

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete Course";
    deleteButton.addEventListener("click", function () {
      newCourse.remove();
    });
    newCourse.appendChild(deleteButton);

    const addButton = document.getElementById("add-course");
    coursesContainer.insertBefore(newCourse, addButton);
  }

  document.getElementById("add-course").addEventListener("click", addCourse);

  // Clear: empty every input and textarea in the form
  document.getElementById("clear-form").addEventListener("click", function () {
    Array.from(form.querySelectorAll("input, textarea")).forEach(
      function (input) {
        input.value = "";
      },
    );
  });
});
