/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import {createCardElement, deleteCard} from "./components/card.js";
import {openModalWindow, closeModalWindow, setCloseModalWindowEventListeners} from "./components/modal.js";
import {enableValidation, clearValidation} from "./components/validation.js";
import {
    getCardList,
    getUserInfo,
    setUserInfo,
    setUserAvatar,
    addCard,
    deleteCard as deleteCardApi,
    changeLikeCardStatus
} from "./components/api.js";

// Настройки валидации (универсальные селекторы и классы)
const validationSettings = {
    formSelector: ".popup__form",
    inputSelector: ".popup__input",
    submitButtonSelector: ".popup__button",
    inactiveButtonClass: "popup__button_disabled",
    inputErrorClass: "popup__input_type_error",
    errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info");
const cardInfoModalSubtitle = cardInfoModalWindow.querySelector(".popup__text");
const cardInfoModalUserList = cardInfoModalWindow.querySelector(".popup__list");

// Переменная для хранения ID текущего пользователя
let currentUserId = null;

// Функция для управления состоянием кнопки во время загрузки
const renderLoading = (button, isLoading, loadingText = "Сохранение...") => {
    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
    } else {
        button.textContent = button.dataset.originalText || button.textContent;
    }
};

// Функция для форматирования даты
const formatDate = (date) =>
    date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

// Функция для создания строки информации из шаблона
const createInfoString = (term, description) => {
    const template = document.getElementById("popup-info-definition-template");
    const infoElement = template.content.querySelector(".popup__info-item").cloneNode(true);

    infoElement.querySelector(".popup__info-term").textContent = term;
    infoElement.querySelector(".popup__info-description").textContent = description;

    return infoElement;
};

// Функция для создания бейджа пользователя
const createUserBadge = (userName) => {
    const template = document.getElementById("popup-info-user-preview-template");
    const userElement = template.content.querySelector(".popup__list-item").cloneNode(true);

    userElement.textContent = userName;

    return userElement;
};

const handlePreviewPicture = ({name, link}) => {
    imageElement.src = link;
    imageElement.alt = name;
    imageCaption.textContent = name;
    openModalWindow(imageModalWindow);
};

const handleDeleteCard = (cardElement, cardId) => {
    deleteCardApi(cardId)
        .then(() => {
            deleteCard(cardElement);
        })
        .catch((err) => {
            alert(`Ошибка при удалении карточки: ${err}`);
        });
};

const handleLikeCard = (cardElement, cardId, likeButton, likeCounter) => {
    const isLiked = likeButton.classList.contains("card__like-button_is-active");
    changeLikeCardStatus(cardId, isLiked)
        .then((updatedCard) => {
            likeButton.classList.toggle("card__like-button_is-active");
            if (likeCounter) {
                likeCounter.textContent = updatedCard.likes.length;
            }
        })
        .catch((err) => {
            alert(`Ошибка при постановке лайка: ${err}`);
        });
};

const handleInfoClick = (cardId) => {
    /* Для вывода корректной информации необходимо получить актуальные данные с сервера. */
    getCardList()
        .then((cards) => {
            // Находим нужную карточку по ID
            const cardData = cards.find((card) => card._id === cardId);

            if (!cardData) {
                return;
            }

            // Очищаем содержимое модального окна
            cardInfoModalInfoList.innerHTML = "";
            cardInfoModalUserList.innerHTML = "";

            // Заполняем заголовок
            cardInfoModalTitle.textContent = "Информация о карточке";

            // Добавляем информацию о карточке
            cardInfoModalInfoList.append(
                createInfoString("Описание:", cardData.name)
            );
            cardInfoModalInfoList.append(
                createInfoString(
                    "Дата создания:",
                    formatDate(new Date(cardData.createdAt))
                )
            );
            cardInfoModalInfoList.append(
                createInfoString("Владелец:", cardData.owner.name)
            );
            cardInfoModalInfoList.append(
                createInfoString("Количество лайков:", cardData.likes.length)
            );

            // Заполняем список пользователей, лайкнувших карточку
            cardInfoModalSubtitle.textContent = "Лайкнули:";

            if (cardData.likes.length > 0) {
                cardData.likes.forEach((user) => {
                    cardInfoModalUserList.append(createUserBadge(user.name));
                });
            } else {
                cardInfoModalUserList.append(createUserBadge("Пока никто не лайкнул"));
            }

            openModalWindow(cardInfoModalWindow);
        })
        .catch((err) => {
            alert(`Ошибка при загрузке информации о карточке: ${err}`);
        });
};

const handleProfileFormSubmit = (evt) => {
    evt.preventDefault();
    const submitButton = evt.submitter;
    renderLoading(submitButton, true, "Сохранение...");

    setUserInfo({
        name: profileTitleInput.value,
        about: profileDescriptionInput.value,
    })
        .then((userData) => {
            profileTitle.textContent = userData.name;
            profileDescription.textContent = userData.about;
            closeModalWindow(profileFormModalWindow);
        })
        .catch((err) => {
            alert(`Ошибка при обновлении профиля: ${err}`);
        })
        .finally(() => {
            renderLoading(submitButton, false);
        });
};

const handleAvatarFromSubmit = (evt) => {
    evt.preventDefault();
    const submitButton = evt.submitter;
    renderLoading(submitButton, true, "Сохранение...");

    setUserAvatar(avatarInput.value)
        .then((userData) => {
            profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
            closeModalWindow(avatarFormModalWindow);
        })
        .catch((err) => {
            alert(`Ошибка при обновлении аватара: ${err}`);
        })
        .finally(() => {
            renderLoading(submitButton, false);
        });
};

const handleCardFormSubmit = (evt) => {
    evt.preventDefault();
    const submitButton = evt.submitter;
    renderLoading(submitButton, true, "Создание...");

    addCard({
        name: cardNameInput.value,
        link: cardLinkInput.value,
    })
        .then((cardData) => {
            placesWrap.prepend(
                createCardElement(
                    cardData,
                    {
                        onPreviewPicture: handlePreviewPicture,
                        onLikeIcon: handleLikeCard,
                        onDeleteCard: handleDeleteCard,
                        onInfoClick: handleInfoClick,
                        userId: currentUserId,
                    }
                )
            );

            closeModalWindow(cardFormModalWindow);
        })
        .catch((err) => {
            alert(`Ошибка при добавлении карточки: ${err}`);
        })
        .finally(() => {
            renderLoading(submitButton, false);
        });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
    profileTitleInput.value = profileTitle.textContent;
    profileDescriptionInput.value = profileDescription.textContent;
    clearValidation(profileForm, validationSettings);
    openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
    avatarForm.reset();
    clearValidation(avatarForm, validationSettings);
    openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
    cardForm.reset();
    clearValidation(cardForm, validationSettings);
    openModalWindow(cardFormModalWindow);
});

// отображение карточек и данных пользователя
Promise.all([getCardList(), getUserInfo()])
    .then(([cards, userData]) => {
        // Сохраняем ID текущего пользователя
        currentUserId = userData._id;

        // Отображаем данные пользователя
        profileTitle.textContent = userData.name;
        profileDescription.textContent = userData.about;
        profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

        // Отображаем карточки
        cards.forEach((data) => {
            placesWrap.append(
                createCardElement(data, {
                    onPreviewPicture: handlePreviewPicture,
                    onLikeIcon: handleLikeCard,
                    onDeleteCard: handleDeleteCard,
                    onInfoClick: handleInfoClick,
                    userId: currentUserId,
                })
            );
        });
    })
    .catch((err) => {
        alert(`Ошибка при загрузке данных: ${err}`);
    });

// Настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
    setCloseModalWindowEventListeners(popup);
});
