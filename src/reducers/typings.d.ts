
declare interface GameState {
    availableRoles: { [key: string]: string }
    customRoles: { [key: string]: string }
    pickedRoles: { [key: string]: number }
    availableEffects: { [key: string]: string }
    players: Player[]
    deal: {
        activeRoleIdx: number
        roleWasVisible: boolean
        roleIsVisible: boolean
    }
}

declare type Player = {
    role: string
    alive: boolean
    effects: string[]
}

declare type Page = "prepare" | "deal" | "play" | "about"

declare interface UIState {
    menuIsOpen: boolean
    currentPage: Page
}

declare interface RootState {
    ui: UIState
    game: GameState
}
