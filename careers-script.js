const ghSlug = "prenuvo";

// Global variables defined here
const departmentIds = [];
const root = document.getElementById("root");
const loading = document.getElementById("loading");
const jobFilter = document.getElementById("filter");
const errorWrapper = document.getElementById("errwrapper");
const errorText = document.getElementById("errtext");

// Filtering function for select element
jobFilter.onchange = function () {
    let selectedSection = this.value;
    // Hide all sections initially
    let accordions = document.querySelectorAll(".careers_accordion");
    accordions.forEach((accordion) => {
      accordion.style.display = "none";
      // Remove 'open' class from all accordion contents and icon wrappers within each section
      let contents = accordion.querySelectorAll(".careers_accordion-content");
      let icons = accordion.querySelectorAll(".careers_icon-wrapper");
      contents.forEach(content => content.classList.remove('open'));
      icons.forEach(icon => icon.classList.remove('open'));
    });
  
    if (selectedSection == "all") {
      // Show and open all sections if "all" is selected
      accordions.forEach((accordion) => {
        accordion.style.display = "block";
        let contents = accordion.querySelectorAll(".careers_accordion-content");
        let icons = accordion.querySelectorAll(".careers_icon-wrapper");
        contents.forEach(content => content.classList.add('open'));
        icons.forEach(icon => icon.classList.add('open'));
      });
    } else {
      // Show and open only the selected section
      let selectedAccordion = document.getElementById(selectedSection);
      selectedAccordion.style.display = "block";
      let contents = selectedAccordion.querySelectorAll(".careers_accordion-content");
      let icons = selectedAccordion.querySelectorAll(".careers_icon-wrapper");
      contents.forEach(content => content.classList.add('open'));
      icons.forEach(icon => icon.classList.add('open'));
    }
  };
  
// Triggers when the DOM is ready
window.addEventListener("DOMContentLoaded", (event) => {
  const handleError = (response) => {
    if (!response.ok) {
      throw Error(`${response.status} ${response.statusText}`);
    } else {
      return response.json();
    }
  };

  fetch(
    "https://boards-api.greenhouse.io/v1/boards/" + ghSlug + "/departments/"
  )
    .then(handleError)
    .then((data) => {
      data.departments.forEach((department) => {
        if (department.jobs.length !== 0) {
          departmentIds.push(department.id);
          let sectionWrapper = document.getElementById("section");
          let sectionClone = sectionWrapper.cloneNode(true);
          sectionClone.id = department.id;
          root.appendChild(sectionClone);
          let option = document.createElement("option");
          option.text = department.name;
          option.value = department.id;
          jobFilter.add(option);
        } else {
          null;
        }
      });
    })
    .catch(function writeError(err) {
      console.error(err);
    })
    .finally(() => {
      writeJobs();
    });
});

// Triggered in finally above
function writeJobs() {
    departmentIds.forEach((departmentId) => {
      const handleError = (response) => {
        if (!response.ok) {
          throw Error(`${response.status} ${response.statusText}`);
        } else {
          return response.json();
        }
      };
  
      fetch(
        "https://boards-api.greenhouse.io/v1/boards/" +
          ghSlug +
          "/departments/" +
          departmentId
      )
        .then(handleError)
        .then((data) => {
          let parent = document.getElementById(data.id);
          let parentContainer = parent.getElementsByClassName("container")[0];
          let careersAccordionTriggers = parent.getElementsByClassName("careers_accordion-trigger");
          let sectionHeading = document.getElementById("dname");
          let sectionTitle = sectionHeading.cloneNode(true);
          sectionTitle.innerText = data.name;
  
          // Assuming each department has its own .careers_accordion-trigger within the same parent
          if (careersAccordionTriggers.length > 0) {
            let careersAccordionTrigger = careersAccordionTriggers[0]; // Assuming you're targeting the first one found
            careersAccordionTrigger.insertBefore(sectionTitle, careersAccordionTrigger.firstChild);
          }
  
          data.jobs.forEach((job) => {
            let listing = document.getElementById("listing");
            let ghListing = listing.cloneNode(true);
            ghListing.id = job.id;

          let jobTitle = ghListing.getElementsByClassName("job-title")[0];
          jobTitle.innerText = job.title;

          let jobLocation = ghListing.getElementsByClassName("job-location")[0];
          jobLocation.innerText = job.location.name;

          let careerButton = ghListing.getElementsByClassName(
            "button is-careers-button"
          )[0];
          if (careerButton) {
            careerButton.href = job.absolute_url;
            careerButton.target = "_blank"; // Open the link in a new tab/window
          }

          parentContainer.appendChild(ghListing);
        });
      })
      .catch(function writeError(err) {
        console.error(err);
      })
     .finally(() => {
        loading.classList.add("invisible");
        loading.remove();
        root.classList.add("visible");
        root.style.height = "92rem";
      });
  });
}
