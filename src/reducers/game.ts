import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'

import { defaultRoles } from '../config'

const resetRolesR: CaseReducer<GameState> = (state) => {
    return { ...state, pickedRoles: _resetPickedRoles(state.availableRoles) }
}

const _resetPickedRoles = (availableRoles: { [key: string]: string }): GameState["pickedRoles"] => {
    let pickedRoles: GameState["pickedRoles"] = {}
    Object.keys(availableRoles).forEach(roleKey => pickedRoles[roleKey] = 0);
    return pickedRoles
}

const dealRolesR: CaseReducer<GameState> = (state) => {
    let players: Player[] = []

    for (let roleKey in state.pickedRoles) {
        for (let i = 0; i < state.pickedRoles[roleKey]; i++) {
            players.push({ role: roleKey, alive: true, effects: [] })
        }
    }

    for (let i = players.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
    }

    return { ...state, players, deal: initialState.deal }
}

let savedCustomRoles = JSON.parse(localStorage.getItem("customRoles") || "{}");

Object.keys(savedCustomRoles).forEach((roleID: string) => {
    if (roleID in defaultRoles) delete savedCustomRoles[roleID];
});

const initialRoles = { ...defaultRoles, ...savedCustomRoles };


const initialState: GameState = function () {
    return {
        availableRoles: { ...initialRoles },
        customRoles: { ...savedCustomRoles },
        pickedRoles: _resetPickedRoles(initialRoles),
        availableEffects: {
            // verliebt: "Verliebt",
            // betrunken: "Betrunken",
        },
        players: [
            // { role: 'dorfbewohner', alive: false, effects: [] },
            // { role: 'werwolf', alive: true, effects: [] },
        ],
        deal: {
            activeRoleIdx: 0,
            roleWasVisible: false,
            roleIsVisible: false,
        }
    }
}();

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        addRole(state, action: PayloadAction<string>): GameState {
            const roleKey = action.payload
            let count = state.pickedRoles[roleKey]
            let pickedRoles = { ...state.pickedRoles }
            pickedRoles[roleKey] = count + 1
            return { ...state, pickedRoles }
        },

        removeRole(state, action: PayloadAction<string>): GameState {
            const roleKey = action.payload
            let count = state.pickedRoles[roleKey]
            if (count <= 0) {
                return state
            }
            let pickedRoles = { ...state.pickedRoles }
            pickedRoles[roleKey] = count - 1
            return { ...state, pickedRoles }
        },

        createCustomRole(state, action: PayloadAction<string>): GameState {
            const newRoleName = action.payload;
            const newRoleID = newRoleName.replaceAll(/[^\w]/g, "").toLowerCase();

            if (newRoleID in state.availableRoles) {
                alert(`Role "${newRoleName}" with ID "${newRoleID}" already exists`)
                return state;
            }

            let customRoles = { ...state.customRoles };
            customRoles[newRoleID] = newRoleName;

            localStorage.setItem("customRoles", JSON.stringify(customRoles));

            return {
                ...state,
                availableRoles: {
                    ...state.availableRoles,
                    [newRoleID]: newRoleName,
                },
                customRoles: { ...customRoles },
                pickedRoles: {
                    ...state.pickedRoles,
                    [newRoleID]: 0,
                },
            };
        },

        deleteCustomRole(state, action: PayloadAction<string>): GameState {
            const roleID = action.payload;
            let customRoles = { ...state.customRoles };
            delete customRoles[roleID];

            localStorage.setItem("customRoles", JSON.stringify(customRoles));

            let availableRoles = { ...state.availableRoles };
            delete availableRoles[roleID];

            let pickedRoles = { ...state.pickedRoles };
            delete pickedRoles[roleID];

            return {
                ...state,
                availableRoles: { ...availableRoles },
                customRoles: { ...customRoles },
                pickedRoles: { ...pickedRoles },
            };
        },

        resetRoles: resetRolesR,
        dealRoles: dealRolesR,

        currentRoleToggleVisibility(state): GameState {
            return {
                ...state,
                deal: {
                    ...state.deal,
                    roleIsVisible: !state.deal.roleIsVisible,
                    roleWasVisible: true,
                }
            }
        },

        dealNextRole(state): GameState {
            if (state.deal.activeRoleIdx + 1 >= state.players.length) {
                return state
            }
            return {
                ...state,
                deal: {
                    activeRoleIdx: state.deal.activeRoleIdx + 1,
                    roleIsVisible: false,
                    roleWasVisible: false,
                }
            }
        },

        togglePlayerAlive(state, action: PayloadAction<number>): GameState {
            let playerID = action.payload
            state.players[playerID].alive = !state.players[playerID].alive
            return state
        },

        createEffect(state, action: PayloadAction<{ newEffect: string, playerID: number }>): GameState {
            const newEffectName = action.payload.newEffect
            const newEffectID = newEffectName.replaceAll(/[^\w]/g, "").toLowerCase();
            const playerID = action.payload.playerID

            if (newEffectID in state.availableEffects) {
                // do nothing
            } else {
                state.availableEffects[newEffectID] = newEffectName
            }

            const effects = state.players[playerID].effects
            const effectActive = effects.includes(newEffectID)
            state.players[playerID].effects = effectActive ? [...effects] : [...effects, newEffectID]

            return state
        },

        deleteEffect(state, action: PayloadAction<string>): GameState {
            const effectID = action.payload
            state.players.forEach(player => {
                const effects = player.effects.filter(effect => effect !== effectID)
                player.effects = [...effects]
            })
            delete state.availableEffects[effectID]
            return state
        },

        togglePlayerEffect(state, action: PayloadAction<{ playerID: number, effectID: string }>): GameState {
            const playerID = action.payload.playerID
            const effectID = action.payload.effectID
            const effects = state.players[playerID].effects
            const effectActive = effects.includes(effectID)
            state.players[playerID].effects = effectActive ? [...effects.filter(effect => effect !== effectID)] : [...effects, effectID]
            return state
        },

        fullReset(state): GameState {
            return {
                ...initialState,
                availableRoles: state.availableRoles,
                pickedRoles: state.pickedRoles,
            }
        },
    }
})

const { actions, reducer } = gameSlice
export const { addRole, removeRole, createCustomRole, deleteCustomRole, resetRoles, dealRoles, currentRoleToggleVisibility, dealNextRole, togglePlayerAlive, fullReset, createEffect, deleteEffect, togglePlayerEffect } = actions
export default reducer
