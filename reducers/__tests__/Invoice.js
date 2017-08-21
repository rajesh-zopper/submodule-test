import invoice from '../Invoice';
import { init } from '../Invoice';
import { Map } from 'immutable';

it('returns the same state on an unhandled action',
() => {
  expect(invoice(init, {})).toEqual(
    init
  );
});

it('handles ADD_ITEM action', () => {

  let item = {
    name: 'Some Item',
    price: 45.50,
  };

  expect(invoice(init, {type: 'ADD_ITEM', item: item})).toEqual(
    init.push(Map(item))
  );
});
