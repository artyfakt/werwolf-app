import { connect, ConnectedProps } from 'react-redux'
import { List, ListItem, Button, Input, Icon } from 'react-onsenui';

import { addRole, removeRole, createCustomRole, deleteCustomRole } from '../reducers/game'

import styles from './RolePicker.module.css';
import { defaultRoles } from '../config'


function mapStateToProps(state: RootState) {
  return { availableRoles: state.game.availableRoles, pickedRoles: state.game.pickedRoles }
}

const mapDispatch = { addRole, removeRole, createCustomRole, deleteCustomRole }
const connector = connect(mapStateToProps, mapDispatch)
export default connector(RolePicker);

type RolePickerProps = ConnectedProps<typeof connector>

function RolePicker({ availableRoles, pickedRoles, addRole, removeRole, createCustomRole, deleteCustomRole }: RolePickerProps) {

  let availableRolesItems = (roleKey: string, idx: number) => (
    <ListItem key={roleKey}>
      <div className="center">{availableRoles[roleKey]}</div>
      <div className="right">
        { !(roleKey in defaultRoles) &&
          <>
            <Button onClick={() => deleteCustomRole(roleKey)}><Icon icon='trash' /></Button>
            &nbsp;&nbsp;
          </>
        }
        <Button onClick={() => removeRole(roleKey)} disabled={pickedRoles[roleKey] <= 0}>-</Button>
        <span className={styles.counter}>{pickedRoles[roleKey]}</span>
        <Button onClick={() => addRole(roleKey)}>+</Button>
      </div>
    </ListItem>
  )

  let _createCustomRole = () => {
    let inputField = document.getElementById('new_role')
    let role_name = (inputField as HTMLInputElement).value
    createCustomRole(role_name)
  }

  let footer = <ListItem key={"new_role"}>
    <div className="center">
      <Input
        value={"Jesus"}
        inputId={"new_role"}
        modifier='material'
        placeholder='new role name' float />
    </div>
    <div className="right">
      <Button onClick={_createCustomRole}>+</Button>
    </div>
  </ListItem>

  return (
    <List
      dataSource={Object.keys(availableRoles)}
      renderRow={availableRolesItems}
      // renderHeader={() => <div>Header</div>}
      renderFooter={() => footer}
    />
  );
}
