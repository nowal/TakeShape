import type { FC } from "react";

export const Index: FC = () => {
  return (
    <div>
      <div>
              <label
                htmlFor="businessName"
                className="block text-md font-medium text-gray-700"
              >
                Business or Personal Name
              </label>
              <input
                type="text"
                id="businessName"
                value={businessName}
                onChange={(event) =>
                  dispatchBusinessName(event.target.value)
                }
                placeholder="Enter your business or personal name"
                required
                className="p-2 border rounded w-full"
              />
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-md font-medium text-gray-700"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                ref={addressInputRef}
                value={address}
                onChange={(event) =>
                  dispatchAddress(event.target.value)
                }
                placeholder="Enter your address"
                required
                className="p-2 border rounded w-full"
              />
            </div>

            <div>
              <label
                htmlFor="range"
                className="block text-md font-medium text-gray-700"
              >
                Range (miles)
              </label>
              <select
                id="range"
                value={range}
                onChange={(event) =>
                  dispatchRange(Number(event.target.value))
                }
                required
                className="p-2 border rounded w-full"
              >
                {[10, 20, 30, 40, 50].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {lat !== 0 && lng !== 0 && (
              <>
                <div className="text-left text-gray-700 mb-2">
                  Drag Marker to adjust service location
                </div>
                <div
                  ref={mapRef}
                  style={{
                    height: '400px',
                    marginTop: '20px',
                  }}
                ></div>
              </>
            )}

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-md font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(event) =>
                  dipatchPhoneNumber(event.target.value)
                }
                placeholder="Enter your phone number"
                required
                className="p-2 border rounded w-full"
              />
            </div>
            <div className="relative h-[96px]">
              <InputsFile
                title="Company Logo (optional)"
                onFile={onLogoChange}
                inputProps={{
                  accept: 'image/*',
                }}
                classValue={cx(
                  'px-4',
                  logoPreview ? 'gap-6' : 'gap-2'
                )}
                isValue={Boolean(logoPreview)}
                icon={{
                  Leading: logoPreview
                    ? () => (
                        <PicOutline>
                          <Image
                            src={logoPreview}
                            alt="Company Logo Preview"
                            className="mb-2 w-24 h-24 object-cover rounded-full"
                            width="96"
                            height="96"
                          />
                        </PicOutline>
                      )
                    : IconsUpload,
                }}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-md font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(event) =>
                  dispatchEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
                className="p-2 border rounded w-full"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-md font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(event) =>
                  dispatchPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
                className="p-2 border rounded w-full"
              />
            </div>
            <button
              type="submit"
              className={`button-green ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>

    </div>
  );
};