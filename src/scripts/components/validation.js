function getErrorElement(formElement, inputElement) {
    return formElement.querySelector(`#${inputElement.id}-error`);
}

function showInputError(formElement, inputElement, message, settings) {
    const errorElement = getErrorElement(formElement, inputElement);
    if (!errorElement) return;

    inputElement.classList.add(settings.inputErrorClass);
    errorElement.textContent = message;
    errorElement.classList.add(settings.errorClass);
}

function hideInputError(formElement, inputElement, settings) {
    const errorElement = getErrorElement(formElement, inputElement);
    if (!errorElement) return;

    inputElement.classList.remove(settings.inputErrorClass);
    errorElement.textContent = "";
    errorElement.classList.remove(settings.errorClass);
}

function hasInvalidInput(inputList) {
    return inputList.some((inputElement) => !inputElement.validity.valid);
}

function disableSubmitButton(buttonElement, settings) {
    buttonElement.classList.add(settings.inactiveButtonClass);
    buttonElement.setAttribute("disabled", "disabled");
}

function enableSubmitButton(buttonElement, settings) {
    buttonElement.classList.remove(settings.inactiveButtonClass);
    buttonElement.removeAttribute("disabled");
}

function toggleButtonState(inputList, buttonElement, settings) {
    if (hasInvalidInput(inputList)) {
        disableSubmitButton(buttonElement, settings);
    } else {
        enableSubmitButton(buttonElement, settings);
    }
}

function checkInputValidity(formElement, inputElement, settings) {
    // Кастомное сообщение для полей с data-error-message при patternMismatch
    if (inputElement.dataset.errorMessage) {
        if (inputElement.validity.patternMismatch) {
            inputElement.setCustomValidity(inputElement.dataset.errorMessage);
        } else {
            inputElement.setCustomValidity("");
        }
    }

    if (!inputElement.validity.valid) {
        showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    } else {
        hideInputError(formElement, inputElement, settings);
    }
}

function setEventListeners(formElement, settings) {
    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);

    // начальное состояние
    toggleButtonState(inputList, buttonElement, settings);

    inputList.forEach((inputElement) => {
        inputElement.addEventListener("input", () => {
            checkInputValidity(formElement, inputElement, settings);
            toggleButtonState(inputList, buttonElement, settings);
        });
    });
}

export function clearValidation(formElement, settings) {
    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);

    inputList.forEach((inputElement) => {
        inputElement.setCustomValidity("");
        hideInputError(formElement, inputElement, settings);
    });

    if (buttonElement) {
        disableSubmitButton(buttonElement, settings);
    }
}

export function enableValidation(settings) {
    const forms = Array.from(document.querySelectorAll(settings.formSelector));
    forms.forEach((formElement) => {
        setEventListeners(formElement, settings);
    });
}