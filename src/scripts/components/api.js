const GROUP_ID = "apf-cohort-202";
const TOKEN = "e269baa8-9378-456f-bc9e-338e5ab687da";

export const config = {
    baseUrl: `https://mesto.nomoreparties.co/v1/${GROUP_ID}`,
    headers: {
        authorization: TOKEN,
        "Content-Type": "application/json",
    },
};


/* Проверяем ответ сервера */
const getResponseData = (res) => (res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`));

export const getUserInfo = () =>
    fetch(`${config.baseUrl}/users/me`, {headers: config.headers}).then(getResponseData);

export const getCardList = () =>
    fetch(`${config.baseUrl}/cards`, {headers: config.headers}).then(getResponseData);

export const setUserInfo = ({name, about}) =>
    fetch(`${config.baseUrl}/users/me`, {
        method: "PATCH",
        headers: config.headers,
        body: JSON.stringify({name, about}),
    }).then(getResponseData);

export const setUserAvatar = (avatar) =>
    fetch(`${config.baseUrl}/users/me/avatar`, {
        method: "PATCH",
        headers: config.headers,
        body: JSON.stringify({avatar}),
    }).then(getResponseData);

export const addCard = ({name, link}) =>
    fetch(`${config.baseUrl}/cards`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({name, link}),
    }).then(getResponseData);

export const deleteCard = (cardId) =>
    fetch(`${config.baseUrl}/cards/${cardId}`, {
        method: "DELETE",
        headers: config.headers,
    }).then(getResponseData);

export const changeLikeCardStatus = (cardId, isLiked) =>
    fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
        method: isLiked ? "DELETE" : "PUT",
        headers: config.headers,
    }).then(getResponseData);