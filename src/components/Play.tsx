import React from 'react'
import { Fab, Icon, Page, List, ListItem, ListTitle, AlertDialog, Button, ToolbarButton, Dialog, Checkbox, Input } from 'react-onsenui';
import { connect, ConnectedProps } from 'react-redux'

import { togglePlayerAlive, fullReset, togglePlayerEffect, createEffect, deleteEffect, generateEffectID } from '../reducers/game'
import { navTo } from '../reducers/ui'
import Toolbar from './Toolbar';

const mapStateToProps = (state: RootState) => ({ players: state.game.players, availableRoles: state.game.availableRoles, availableEffects: state.game.availableEffects })
const mapDispatch = { togglePlayerAlive, fullReset, navTo, togglePlayerEffect, createEffect, deleteEffect }
const connector = connect(mapStateToProps, mapDispatch)

const pStyle: React.CSSProperties = {
  textAlign: 'center',
  opacity: 0.6,
};

type PlayProps = ConnectedProps<typeof connector>
type PlayState = { endAlertIsOpen: boolean, playerDetailsAreOpen: boolean, selectedPlayer: number }

class Play extends React.Component<PlayProps, PlayState> {
  constructor(props: PlayProps) {
    super(props)
    this.state = { endAlertIsOpen: false, playerDetailsAreOpen: false, selectedPlayer: 0 }
  }

  endGameOk() {
    this.setState({ endAlertIsOpen: false });
    this.props.fullReset();
    this.props.navTo('prepare');
  }

  endGameCancel() {
    this.setState({ endAlertIsOpen: false });
  }

  playerDetailsClose() {
    this.setState({ playerDetailsAreOpen: false })
  }

  submitNewEffect(event: React.SyntheticEvent) {
    event.preventDefault()
    const target = event.target as typeof event.target & { newEffect: { value: string } }
    const effect = target.newEffect.value
    const effectID = generateEffectID(effect)

    if (effectID in this.props.availableEffects) {
      alert(`Effect "${effect}" with ID "${effectID}" already exists`)
      return
    }

    this.props.createEffect({ newEffect: effect })
    this.props.togglePlayerEffect({ playerID: this.state.selectedPlayer, effectID })

    target.newEffect.value = ""
  }

  render() {
    let { players, togglePlayerAlive, togglePlayerEffect, deleteEffect } = this.props
    let { endAlertIsOpen, playerDetailsAreOpen, selectedPlayer } = this.state
    return (
      <Page
        renderToolbar={() => (<Toolbar />)}
        renderFixed={() =>
          <div>
            <Fab position="bottom left" onClick={() => this.setState({ endAlertIsOpen: true })}><Icon icon='fa-undo' /></Fab>
          </div>
        }
      >

        <p style={pStyle}>
          Dein Dorf hat <span id="total_cnt">{countAlivePlayers(players)} von {players.length}</span> Einwohnern
        </p>
        <div className="scrollable_content">
          <List
            dataSource={players}
            renderRow={(player: Player, playerID: number) => (
              <ListItem key={playerID} className={'player' + (!player.alive ? ' isDead' : '')}>
                <div>
                  {playerID + 1}: {this.props.availableRoles[player.role]}
                </div>
                <div>
                  {player.effects.map(effectID => {
                    return (
                      <Button key={effectID} className="button--outline button--effect" onClick={() => togglePlayerEffect({ playerID: playerID, effectID: effectID })}>
                        {this.props.availableEffects[effectID]}
                        <Icon icon="fa-close" />
                      </Button>
                    )
                  })}
                  <button onClick={() => togglePlayerAlive(playerID)} className=" button button--outline">
                    <Icon icon={player.alive ? 'skull-crossbones' : 'medkit'} />
                  </button>
                  <ToolbarButton>
                    <Icon icon="bars" onClick={() => this.setState({ playerDetailsAreOpen: true, selectedPlayer: playerID })} />
                  </ToolbarButton>
                </div>
              </ListItem>
            )}
          />
        </div>


        <AlertDialog isOpen={endAlertIsOpen} isCancelable={true} onCancel={this.endGameCancel.bind(this)}>
          <div className="alert-dialog-title">Warnung!</div>
          <div className="alert-dialog-content">
            Soll das aktuelle Spiel wirklich beendet werden?
          </div>
          <div className="alert-dialog-footer flex">
            <Button onClick={this.endGameOk.bind(this)} className="alert-dialog-button">
              Ja
            </Button>
            <Button onClick={this.endGameCancel.bind(this)} className="alert-dialog-button">
              Nein
            </Button>
          </div>
        </AlertDialog>

        <Dialog isOpen={playerDetailsAreOpen} isCancelable={true} onCancel={this.playerDetailsClose.bind(this)}>
          <ListTitle>
            {selectedPlayer + 1}: {this.props.availableRoles[players[selectedPlayer].role]}
          </ListTitle>
          <List
            dataSource={Object.keys(this.props.availableEffects)}
            renderRow={(effectID: string) => (
              <ListItem key={effectID}>
                <label className="left">
                  <Checkbox
                    inputId={effectID}
                    checked={players[selectedPlayer].effects.includes(effectID)}
                    onChange={() => togglePlayerEffect({ playerID: selectedPlayer, effectID })}
                    modifier="noborder"
                  />
                </label>
                <label htmlFor={effectID}>
                  {this.props.availableEffects[effectID]}
                </label>
                <button className="right button--dialog" onClick={() => deleteEffect(effectID)}>
                  <Icon icon="trash" />
                </button>
              </ListItem>
            )}
            renderFooter={() => (
              <div className="effect-input">
                <form onSubmit={this.submitNewEffect.bind(this)}>
                  <Input name="newEffect" placeholder="Neuer Effekt" autocomplete="off" />
                  <button type="submit" className="right button--dialog">
                    <Icon icon="plus" />
                  </button>
                </form>
              </div>
            )}
          />
          <Button onClick={this.playerDetailsClose.bind(this)} className="alert-dialog-button">Schließen</Button>
        </Dialog>

      </Page >
    );
  }
}

const countAlivePlayers = (players: Player[]) => players.reduce((c, p) => c + (p.alive ? 1 : 0), 0)

export default connector(Play);
