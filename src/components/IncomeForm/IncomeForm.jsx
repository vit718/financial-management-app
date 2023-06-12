import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatDate } from '../../utils/dateFormat';
import { addIncomeAction } from '../../store/actions/incomeActions';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { firestore } from '../../firebase';
import styles from './IncomeForm.module.css';
import CustomInput from '../form/Input/CustomInput';
import CustomButton from '../form/Button/CustomButton';
import Dropdown from '../form/Dropdown/Dropdown';

function IncomeForm() {
  const { currentUser } = useAuth();
  const incomes = useSelector((state) => state.incomes.incomes);
  const dispatch = useDispatch();
  const [incomeItem, setIncomeItem] = useState({
    amount: null,
    type: '',
  });
  const [dropdownError, setDropdownError] = useState(false);
  const [dropdownPlaceholder, setDropdownPlaceholder] =
    useState('Type of Income');
  const [inputError, setInputError] = useState('');

  const options = [
    { value: 'Taxable', label: 'Taxable' },
    { value: 'Non-taxable', label: 'Non-taxable' },
  ];

  const handleAddIncome = useCallback(
    async (e) => {
      e.preventDefault();

      if (!incomeItem.type) {
        setDropdownError(true);
        return;
      }

      const income = {
        amount: incomeItem.amount,
        type: incomeItem.type,
        date: formatDate(new Date()),
        id: Date.now(),
      };
      dispatch(addIncomeAction(income));

      await setDoc(doc(firestore, 'users', currentUser?.uid), {
        incomes: [...incomes, income],
      });
      setIncomeItem({ amount: '', type: '' });
      setInputError('');
      setDropdownPlaceholder('Type of Income');
    },
    [currentUser?.uid, incomeItem.amount, incomeItem.type, dispatch, incomes]
  );

  const handleDropdownChange = (option) => {
    setIncomeItem({ ...incomeItem, type: option.value });
    setDropdownError(false);
  };

  const handleInputChange = (value) => {
    setIncomeItem({ ...incomeItem, amount: value });
    if (value === '') {
      setInputError('Enter the value');
    } else {
      setInputError('');
    }
  };

  return (
    <form onSubmit={(e) => handleAddIncome(e)} className={styles.form}>
      <h2 className={styles.title}>Write down your income</h2>
      <div className={styles.inputs}>
        <CustomInput
          label="Amount"
          type="number"
          id="income"
          step="0.01"
          value={incomeItem.amount}
          error={inputError}
          required
          onChange={handleInputChange}
        />
        <Dropdown
          placeHolder={dropdownPlaceholder}
          setPlaceHolder={setDropdownPlaceholder}
          options={options}
          onChange={handleDropdownChange}
          error={dropdownError}
        />
        <CustomButton type="submit" title="Add income" />
      </div>
    </form>
  );
}

export default IncomeForm;
