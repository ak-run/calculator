import "./index.css"
import {useReducer} from "react"
import DigitButton from "./DigitButton"
import OperationButton from "./OperationButton"

//Actions we'll need. They're global variables, so in all caps. 
export const ACTIONS = {
  ADD_DIGITS: "add-digits",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR_OUT: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate",

}

//Function reducer - we'll need parameters of type and payload
function reducer(state, { type, payload }) {
  const { currentOperand } = state;
  //switch to add cases for each type of action
  switch(type) {
    //when user clicks digits
    case ACTIONS.ADD_DIGITS:
      //After user clicks = the state is overwrite. Then after users enters a digit the current and previous operand is clear
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          //change overwite to false otherwise it would keep overwriting
          overwrite: false,
        }
      }
      //this is so if user adds zero in the begiining, they can't add more zeros
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state
      }
      //this is so if user adds dot they can't add more dots
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        return state
      }
      return {
        ...state,
      //This means that when user clicks more digits the number will grow. 
        currentOperand: `${currentOperand || ""}${payload.digit}`,
      }
    //when user clicks on arithmetic operators +, -, *, or /
    case ACTIONS.CHOOSE_OPERATION:
    //if user clicks on arithmetic operators but there are no numbers in either operand, the state doesn't change
        if (state.currentOperand == null && state.previousOperand == null) {
          return state
        }

        //if user clicks on an arithmetic operator, but then changes their mind and chooses another, arithmetic operator is set to the newest output (payload)
        if (state.currentOperand == null) {
          return {
            ...state,
            operation: payload.operation,
          }
        }

        //if user enters a number, there's no number in previous operand and then enters an arithmetic operator, the state in currentOperand is moved to previousOperand 
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
          //operation will change to the arithmetic operator that user entered
          operation: payload.operation,
         //current operand is empty
          currentOperand: null,
        }

    //When user clicks on AC return nothing
    case ACTIONS.CLEAR_OUT:
      return {}

    //When user clicks on DEL delete last digit
    case ACTIONS.DELETE_DIGIT:
      //if state is overwrite (after entering "=") currentOperand is emtpy and overwrite changes to false
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        }
      }
      //if currentOperand is null we have nothing to delete so return a current state
      if (state.currentOperand == null) return state
      //if currentOperand has just 1 digit, then clear currentOperand
      if (state.currentOperand.length === 1) {
        return {
        ...state,
        //set to null because we don't want to leave anything in currentOpearand, not even an empty string
        currentOperand: null,
        }
      }
      //finally the default state when deleting
      return {
        ...state,
        //this removes last digit from this current operand, it'll return string from index 0 to index -1
        currentOperand: state.currentOperand.slice(0,-1),
      }
        
    //When user clicks "="
    case ACTIONS.EVALUATE:
    // first checking that we have all the information. If any is missing we want to just return current state
      if (state.operation == null || state.currentOperand == null || state.previousOperand == null) {
        return state
      }

      return {
        ...state,
        //when user clicks on "=" we want previous operand and operation to clear and current operand to show result of operation
        //in normal calculator after user clicks = if user then enters new digit, it'll overwrite the current state
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      }

    //default case
    default:
      return state;
  }
}

//evaluate function to make all calculations possible
function evaluate( {currentOperand, previousOperand, operation}) {
  //we need to convert strings into numbers
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  //if prev or current are not numbers then return empty string
  if (isNaN (prev) || isNaN(current)) return ""
  //by default our evaluation equals to an empty string
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

//to format number to add comma to big numbers and max fraction digits of 0
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
})
function formatOperand(operand) {
  // if operand is null or undefined, return
  if (operand == null) return
  // split the operand into integer and decimal parts, because decimal parts can have multiple zeros at the beginning
  const [integer, decimal] = operand.split(".")
  // if there is no decimal part, format the integer part and return
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  // otherwise, format both integer and decimal parts and return the formatted string
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

//A reducer is a function that takes in two arguments: the current state and an action object. It returns a new state based on the action that was dispatched.
function App() {
  const [{currentOperand, previousOperand, operation}, dispatch] = useReducer (reducer, {})
  return (
    <div className="calculator-grid">
      <div className="output">
      {/* contains number and arithhmetic operator */}
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
