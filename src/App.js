import "./App.css"
import {useReducer} from "react"
import DigitButton from "./DigitButton"
import OperationButton from "./OperationButton"

// global variable in all caps
export const ACTIONS = {
  ADD_DIGITS: "add-digits",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR_OUT: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate",

}

//we're splitting action into type and payload (parameter)
function reducer(state, { type, payload }) {
  const { currentOperand } = state;
  switch(type) {
    case ACTIONS.ADD_DIGITS:
      //This is to overwrite currentOpearnd after we did =
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          //we then change overwite to false otherwise it would keep overwriting
          overwrite: false,
        }
      }
      //this is so if user adds 0 in the begiining, you can't add more 0s
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state
      }
      //this is so if user adds dot they can't add more dots
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        return state
      }
      return {
        ...state,
      //This means that when you add digits it'll continue growing the number
        currentOperand: `${currentOperand || ""}${payload.digit}`,
      }

    case ACTIONS.CHOOSE_OPERATION:
    //if user clicks on * + etc. but there are no numbers, nothing happens
        if (state.currentOperand == null && state.previousOperand == null) {
          return state
        }

        //if user chooses an operation, but then changes their mind and chooses another, operation is equal what user entered now (payload)
        if (state.currentOperand == null) {
          return {
            ...state,
            operation: payload.operation,
          }
        }

        if (state.currentOperand == null) {
          return {
            ...state,
            operation: payload.operation,
          }
        }

        //if user enters a number, there's no old number and then enters an operation like + * -
        if (state.previousOperand == null) {
          return {
            ...state,
            operation: payload.operation,
            previousOperand: state.currentOperand,
            currentOperand: null,
          }
        }

        //when user enters a number, then operation, then another operation
        return {
          ...state,
          //previous state to change based on last operation. e.g. click 2 + 2 then another operation, previous operand will be 4
          previousOperand: evaluate(state),
          //operation will change to the payload user entered
          operation: payload.operation,
         //current operand turn to null
          currentOperand: null,
        }

//This is for AC, when you click, return nothing
    case ACTIONS.CLEAR_OUT:
      return {}
    //this if for DEL
    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        }
      }
      //if currentOperand is null we have nothing to delete so return a current state
      if (state.currentOperand == null) return state
      //if just 1 digit, then clear
      if (state.currentOperand.length === 1) {
        return {
        ...state,
        //it's because we don't want to leave anything in currentOpearand, not even an empty string
        currentOperand: null,
        }
      }
      //finally the default state when deleting
      return {
        ...state,
        //this removes last digit from this current operand
        currentOperand: state.currentOperand.slice(0,-1),
      }
      

        
    //this is for = sign
    case ACTIONS.EVALUATE:
    // first checking that we have all the information. If any is missing we want to just return current state
      if (state.operation == null || state.currentOperand == null || state.previousOperand == null) {
        return state
      }

      return {
        ...state,
        //when user clicks on = we want previous operand and operation to clear and current operand to show result of operation
        //in normal calculator after user clicks = if user then enters new digit, it'll overwrite the current state
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      }

    // Add other cases for other actions
    default:
      return state;
  }
}

//we need to set up evaluate function
function evaluate( {currentOperand, previousOperand, operation}) {
  //now we need to convert these strings currentOperand etc. into numbers or operations. parseFloat is a function to do that
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  //if prev or current are not numbers then return empty string
  if (isNaN (prev) || isNaN(current)) return ""
  //by default our computation equals to an empty string
  let computation = ""
  //now switch through different statements for our operation
  switch (operation) {
    case "+":
      computation = prev + current
      break
    case "-":
      computation = prev - current
      break
    case "*":
      computation = prev * current
      break
    case "÷":
      computation = prev / current
      break
  }
  //once the right operation happens we want to return our computation as string
  return computation.toString()
}

//to format number to add , to big numbers
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
})
function formatOperand(operand) {
  if (operand == null) return
  const [integer, decimal] = operand.split(".")
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}


function App() {
  const [{currentOperand, previousOperand, operation}, dispatch] = useReducer (reducer, {})
  return (
    <div className="calculator-grid">
      <div className="output">
      {/*contains number and sign */}
      <div className="previous-operand"> {formatOperand(previousOperand)} {operation} </div>
        {/* contains number user is typing */}
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button className="span-two" onClick={() => dispatch({ type: ACTIONS.CLEAR_OUT })}>AC</button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>DEL</button>
      <OperationButton operation="÷" dispatch={dispatch}/>
      <DigitButton digit="1" dispatch={dispatch}/>
      <DigitButton digit="2" dispatch={dispatch}/>
      <DigitButton digit="3" dispatch={dispatch}/>
      <OperationButton operation="*" dispatch={dispatch}/>
      <DigitButton digit="4" dispatch={dispatch}/>
      <DigitButton digit="5" dispatch={dispatch}/>
      <DigitButton digit="6" dispatch={dispatch}/>
      <OperationButton operation="+" dispatch={dispatch}/>
      <DigitButton digit="7" dispatch={dispatch}/>
      <DigitButton digit="8" dispatch={dispatch}/>
      <DigitButton digit="9" dispatch={dispatch}/>
      <OperationButton operation="-" dispatch={dispatch}/>
      <DigitButton digit="." dispatch={dispatch}/>
      <DigitButton digit="0" dispatch={dispatch}/>
      <button className="span-two" onClick={() => dispatch({ type: ACTIONS.EVALUATE })}>=</button>
    </div>
  );
}

export default App;
