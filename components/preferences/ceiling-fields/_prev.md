    <label className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          name="ceilings"
          checked={props.isCeilingsPainted}
          onChange={props.onChange}
        />
      </label>
      <div>Do you want your ceilings painted?</div>
      <label className="text-left">
            Ceiling Color
            <input
              type="text"
              name="ceilingColor"
              placeholder="Ceiling Color"
              value={props.ceilingColor || 'White'}
              onChange={props.onChange}
              className="input-field"
            />
          </label>


       <InputsColorPickerInputControlled
            name="ceilingColor"
            value={props.ceilingColor || 'White'}
            onValueChange={onValueChange}
          />
