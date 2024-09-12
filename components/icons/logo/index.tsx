import {
  CommonIcon,
  TCommonIconFC,
} from '@/components/icon';
import { TShellLogoProps } from '@/components/shell/logo/types';
import { cx } from 'class-variance-authority';

export const IconsLogo: TCommonIconFC<TShellLogoProps> = (
  {isLarge, ...props}
) => {
  return (
    <CommonIcon
      width="48"
      height="32"
      viewBox="0 0 48 32"
      classValue={cx(isLarge ? '' : "w-[34px] h-[23px] lg:w-[48px] lg:h-[32px]")}
      fill="none"
      {...props}
    >
      <path
        d="M23.4329 29.9395C2.93984 30.1125 -5.40438 13.4673 9.64116 4.8204C24.6867 -3.82646 45.3094 3.65307 45.05 10.83C44.7993 17.7388 30.1774 12.3864 30.0045 19.4768C29.8921 23.9732 43.0526 20.2291 44.4015 23.5841C46.0877 27.7778 32.5986 29.9395 32.5986 29.9395"
        fill="white"
      />
      <path
        d="M23.4342 30.1557C22.0507 30.3891 20.6413 30.4929 19.2232 30.5016C17.8051 30.5016 16.3697 30.3805 14.9516 30.147C13.5249 29.9049 12.1155 29.5417 10.732 29.0316C9.34848 28.5214 8.00821 27.8643 6.73712 27.0428C6.1059 26.6364 5.49197 26.1781 4.90399 25.6852C4.32465 25.1837 3.76261 24.6476 3.25244 24.0596C2.73363 23.4717 2.2667 22.8404 1.843 22.1573C1.42795 21.4742 1.06478 20.7565 0.770791 19.9956C0.623795 19.6152 0.502737 19.226 0.390327 18.8283C0.286565 18.4305 0.200097 18.0328 0.130922 17.6264C0.00986564 16.8136 -0.0333644 15.9748 0.0271636 15.1534C0.14822 13.5018 0.658381 11.9022 1.44525 10.51C1.83435 9.80962 2.29264 9.16975 2.79416 8.57312C3.28703 7.97648 3.84043 7.43173 4.40247 6.93886C5.54386 5.94447 6.78901 5.13167 8.06874 4.44857C8.38868 4.27563 8.7086 4.11134 9.03719 3.9557C9.36577 3.80005 9.6857 3.65306 10.0143 3.51471C10.6714 3.22936 11.3286 2.96131 11.9944 2.7192C13.326 2.22632 14.6749 1.81128 16.0411 1.44811C18.7649 0.739065 21.5578 0.306722 24.3767 0.107845C27.1956 -0.0823862 30.0577 -0.0391519 32.9198 0.384544C34.3465 0.592069 35.7733 0.903356 37.1741 1.3357C37.8745 1.55187 38.5749 1.80263 39.258 2.08798C39.9497 2.37332 40.6242 2.69326 41.29 3.05642C41.9558 3.41959 42.6129 3.83464 43.2442 4.30157C43.884 4.7685 44.498 5.29596 45.0773 5.91853C45.6566 6.54111 46.1927 7.26744 46.6078 8.15807C46.7115 8.38289 46.798 8.60771 46.8845 8.84982C46.9623 9.09193 47.0315 9.34269 47.0834 9.60209C47.1352 9.8615 47.1698 10.1296 47.1871 10.3976C47.1958 10.536 47.2044 10.6657 47.2044 10.804V10.9078V11.0029C47.2044 11.0634 47.2044 11.1326 47.1958 11.1931C47.1612 11.7033 47.0661 12.2567 46.8758 12.8014C46.6856 13.3462 46.383 13.8909 46.0112 14.3492C45.6393 14.8075 45.207 15.188 44.7747 15.4906C44.3423 15.7932 43.9013 16.0181 43.4776 16.1996C42.6216 16.5628 41.8174 16.7617 41.0565 16.926C40.2869 17.0816 39.5606 17.1767 38.8516 17.2719L36.7936 17.5053C36.1364 17.5831 35.4966 17.661 34.9086 17.7647C34.3206 17.8685 33.7758 17.9982 33.3435 18.1625C33.1273 18.2403 32.9458 18.3354 32.7988 18.4219C32.6518 18.5084 32.548 18.5862 32.4702 18.664C32.3923 18.7418 32.3405 18.811 32.2886 18.9148C32.2367 19.0185 32.1935 19.1482 32.1675 19.3212C32.1589 19.3644 32.1589 19.4076 32.1502 19.4595L32.1416 19.5287C32.1416 19.5373 32.1416 19.5373 32.1416 19.5373C32.1329 19.5373 32.1329 19.5027 32.107 19.4509C32.0897 19.4076 32.0465 19.3471 32.0205 19.3125C31.986 19.2779 31.9687 19.2693 31.9687 19.2779C31.9773 19.2952 32.0897 19.3817 32.2713 19.4595C32.4529 19.5373 32.695 19.6065 32.9544 19.6757C33.4819 19.8054 34.0958 19.8832 34.7357 19.9524C35.3755 20.0129 36.0413 20.0561 36.7158 20.0994C37.3989 20.1426 38.0906 20.1772 38.7997 20.2204C39.5087 20.2723 40.2264 20.3328 40.97 20.4366C41.3419 20.4885 41.7223 20.549 42.1114 20.6355C42.5005 20.722 42.8983 20.8257 43.322 20.9814C43.7457 21.137 44.1867 21.3359 44.6536 21.6818C44.766 21.7682 44.8784 21.872 44.9908 21.9757C45.1032 22.0882 45.207 22.2092 45.3021 22.3389C45.3972 22.4773 45.4923 22.6243 45.5702 22.7713C45.6048 22.8491 45.6393 22.9269 45.6739 23.0047L45.6999 23.0653L45.7172 23.1171L45.7517 23.2209C45.8382 23.4889 45.8901 23.7916 45.8987 24.0942C45.9074 24.3969 45.8728 24.7168 45.795 25.0021C45.7172 25.2875 45.6048 25.5555 45.4664 25.789C45.3281 26.0225 45.1811 26.23 45.0168 26.4116C44.6968 26.7748 44.3596 27.0428 44.0137 27.2849C43.6765 27.5184 43.3306 27.7173 42.9847 27.8902C42.293 28.2361 41.6099 28.4955 40.9182 28.7203C39.5433 29.1613 38.1598 29.4639 36.7763 29.6974C35.3928 29.9222 34.0093 30.0865 32.6085 30.1643L32.5394 29.7406C33.8623 29.3515 35.168 28.9278 36.4564 28.4695C37.0962 28.2361 37.7361 27.994 38.3587 27.7346C38.9813 27.4752 39.5952 27.2071 40.1832 26.9045C40.7712 26.6105 41.3332 26.2905 41.8434 25.936C42.0941 25.7631 42.3276 25.5815 42.5351 25.3913C42.734 25.201 42.9069 25.0108 43.0193 24.8292C43.1317 24.6476 43.175 24.5006 43.175 24.4142C43.175 24.3709 43.1663 24.3363 43.149 24.2931C43.1404 24.2585 43.1145 24.2153 43.0885 24.1634L43.0799 24.1461L43.0712 24.1375H43.0626C43.0539 24.1375 43.0539 24.1375 43.0453 24.1375C43.028 24.1375 43.0021 24.1202 42.9502 24.0942C42.8464 24.0423 42.6475 23.9732 42.4141 23.9213C42.1806 23.8694 41.9039 23.8262 41.6099 23.8002C41.3159 23.7743 41.0133 23.757 40.702 23.7484C40.0708 23.7311 39.4136 23.7484 38.7391 23.7656L36.6812 23.8348C35.9808 23.8608 35.2718 23.8781 34.5281 23.8608C33.7845 23.8521 33.0322 23.8089 32.2021 23.6878C31.7871 23.6187 31.3547 23.5322 30.8878 23.3765C30.6543 23.2987 30.4122 23.2036 30.1528 23.0825C29.9021 22.9615 29.634 22.8058 29.3659 22.5983C29.0979 22.3908 28.8299 22.14 28.5964 21.8288C28.3629 21.5175 28.164 21.1456 28.043 20.7738C27.9133 20.3934 27.8528 20.0216 27.8355 19.6757C27.8355 19.5892 27.8355 19.5027 27.8268 19.4249V19.2433C27.8355 19.1223 27.8355 18.9926 27.8527 18.8629C27.896 18.3527 28.0084 17.808 28.2159 17.2632C28.4234 16.7271 28.7347 16.1996 29.1065 15.7587C29.4784 15.309 29.9107 14.9459 30.343 14.6519C30.7754 14.3579 31.2077 14.1417 31.6314 13.9601C32.4788 13.6056 33.2743 13.3981 34.0439 13.2424C34.8048 13.0868 35.5398 12.983 36.2489 12.8965C36.9579 12.8101 37.641 12.7409 38.3068 12.6631C38.964 12.5853 39.6038 12.5074 40.1918 12.395C40.7798 12.2913 41.3159 12.1529 41.7396 11.9886C41.9471 11.9108 42.1287 11.8157 42.2671 11.7379C42.4054 11.6514 42.5005 11.5736 42.5697 11.5044C42.6389 11.4352 42.6821 11.3661 42.734 11.2709C42.7772 11.1758 42.8205 11.0375 42.8378 10.8645C42.8378 10.8472 42.8464 10.8213 42.8464 10.7954V10.7608V10.7348C42.8464 10.7002 42.855 10.6657 42.855 10.6311C42.855 10.5532 42.855 10.4841 42.8464 10.3976C42.8378 10.3198 42.8205 10.2333 42.8032 10.1468C42.7772 10.0604 42.7513 9.96526 42.7167 9.87015C42.5784 9.48969 42.3276 9.06599 41.9904 8.65959C41.6618 8.24454 41.2554 7.84678 40.8057 7.46632C40.3561 7.08586 39.8632 6.73134 39.3444 6.39411C38.8256 6.05688 38.2809 5.73695 37.7188 5.44296C37.1568 5.14896 36.5774 4.86362 35.9895 4.59556C34.8048 4.06811 33.577 3.60118 32.3145 3.20342C29.7897 2.40791 27.1264 1.8891 24.4372 1.78534C21.7481 1.67293 19.0243 1.98421 16.4303 2.73649C15.1332 3.11695 13.8794 3.60982 12.6775 4.22375C12.0809 4.52639 11.5015 4.85497 10.9309 5.21814C10.6455 5.39107 10.3688 5.58131 10.1008 5.77154C9.8327 5.96177 9.56465 6.152 9.30524 6.35088C8.26762 7.15503 7.31646 8.04566 6.52095 9.01411C6.32207 9.25622 6.13185 9.50698 5.95026 9.75774C5.76868 10.0085 5.59574 10.2593 5.44009 10.5187C5.12016 11.0375 4.85211 11.5649 4.62729 12.101C4.17765 13.1732 3.92689 14.28 3.89231 15.3868C3.85772 16.4936 4.03066 17.5918 4.40247 18.664C4.78293 19.7362 5.36227 20.7565 6.09725 21.699C6.83224 22.6416 7.71422 23.5062 8.69996 24.2845C9.6857 25.054 10.7666 25.7371 11.9079 26.3338C13.0493 26.9304 14.2599 27.4406 15.5137 27.8816C16.7675 28.3225 18.0559 28.6771 19.3788 28.9883C20.7018 29.291 22.0507 29.5245 23.4256 29.7406L23.4342 30.1557Z"
        fill="#FF385C"
      />
      <path
        d="M12.9488 12.5314C13.549 12.6472 14.2299 11.7338 14.4697 10.4912C14.7096 9.24862 14.4174 8.1474 13.8172 8.03157C13.217 7.91574 12.5361 8.82915 12.2963 10.0717C12.0564 11.3143 12.3486 12.4155 12.9488 12.5314Z"
        fill="#FF385C"
      />
      <path
        d="M12.9138 12.7012C12.7626 12.6632 12.6316 12.6115 12.487 12.5395C12.3509 12.4692 12.2079 12.3888 12.058 12.2982L11.9389 12.2312L11.8214 12.1557C11.7345 12.1037 11.6647 12.055 11.5879 11.9962C11.5112 11.9373 11.4345 11.8785 11.3679 11.8128C11.2929 11.7455 11.2263 11.6798 11.1597 11.6141C11.1307 11.5821 11.0948 11.5399 11.0657 11.5079C11.0367 11.4759 11.0093 11.4354 10.9819 11.3948C10.9254 11.3223 10.8791 11.2429 10.8413 11.1652C10.7571 11.008 10.7086 10.8489 10.6855 10.6948C10.6494 10.3796 10.7169 10.0756 10.8846 9.79973C11.0523 9.52387 11.3255 9.29479 11.5853 9.08953C11.8536 8.88592 12.1084 8.70614 12.2885 8.50312C12.4771 8.30174 12.618 8.07355 12.818 7.81274C12.9138 7.68151 13.0383 7.53822 13.2171 7.38778C13.4027 7.24747 13.6732 7.12355 14.0037 7.09927C14.3326 7.08349 14.6673 7.1745 14.9363 7.33209C14.9993 7.37067 15.0538 7.40761 15.1168 7.44619L15.2105 7.5083C15.2412 7.53184 15.265 7.54524 15.2872 7.56714C15.3401 7.61257 15.3844 7.65636 15.4288 7.70015C15.4732 7.74395 15.5091 7.7861 15.5535 7.82989C15.873 8.18216 16.0145 8.54412 16.1338 8.88417C16.2531 9.22423 16.33 9.55609 16.3627 9.88825C16.3971 10.2119 16.3688 10.5411 16.2844 10.8418C16.2379 10.9914 16.1914 11.1409 16.1179 11.294C16.0459 11.4387 15.974 11.5833 15.8697 11.7129C15.668 11.9822 15.3609 12.2047 14.9973 12.3547C14.8147 12.434 14.6183 12.4929 14.4322 12.5451C14.3391 12.5711 14.2476 12.5887 14.146 12.6131L14.0088 12.6395L13.8717 12.6659C13.6989 12.6942 13.5277 12.714 13.3752 12.7286C13.2158 12.733 13.0581 12.729 12.9138 12.7012ZM12.9793 12.3616C13.0573 12.3678 13.1351 12.33 13.1923 12.2618C13.2426 12.1834 13.2708 12.0832 13.2683 11.9594C13.2696 11.9068 13.2572 11.834 13.2432 11.7696C13.2292 11.7053 13.2067 11.6393 13.1843 11.5733C13.1601 11.5158 13.1308 11.4397 13.1067 11.3822C13.074 11.3231 13.0431 11.2554 13.0104 11.1963C12.88 10.9598 12.7514 10.7588 12.713 10.5929C12.6853 10.5083 12.6814 10.4371 12.6707 10.3558C12.6668 10.2846 12.6561 10.2032 12.6607 10.1337C12.6537 9.85053 12.8097 9.59002 12.9065 9.36213L12.9399 9.2805C12.9533 9.25667 12.9683 9.22435 12.9716 9.20737C12.9833 9.19202 12.9984 9.1597 13.0186 9.146L13.0507 9.11695C13.0608 9.1101 13.0709 9.10325 13.0895 9.09804C13.0997 9.09119 13.1199 9.07748 13.1284 9.07912C13.147 9.07391 13.164 9.07718 13.1741 9.07033C13.1826 9.07197 13.1928 9.06512 13.2029 9.05827C13.2114 9.05991 13.2199 9.06155 13.2385 9.05633C13.2571 9.05112 13.2842 9.04755 13.3028 9.04233C13.4012 9.03489 13.5367 9.01701 13.638 8.9485C13.7461 8.89011 13.7743 8.78987 13.7501 8.73237C13.7159 8.68173 13.6428 8.65 13.5751 8.68098C13.4278 8.71419 13.2932 8.86434 13.247 9.05797C13.2008 9.25161 13.2686 9.49365 13.3837 9.71842C13.4887 9.95004 13.6512 10.1575 13.722 10.3385C13.8012 10.5211 13.8175 10.6652 13.754 10.8114C13.7223 10.8846 13.6736 10.9544 13.6062 11.0295C13.5726 11.067 13.5304 11.1029 13.4866 11.1473C13.4445 11.1832 13.3922 11.226 13.3484 11.2703C13.2523 11.3575 13.1461 11.4515 13.0553 11.5572C13.0098 11.6101 12.9644 11.663 12.9275 11.7175C12.8905 11.772 12.8621 11.8282 12.8421 11.886C12.7937 11.9999 12.791 12.1051 12.8171 12.1982C12.8363 12.2811 12.9029 12.3468 12.9793 12.3616Z"
        fill="#FF385C"
      />
      <path
        d="M18.3994 8.56753C19.3185 9.48551 20.526 9.76676 21.0963 9.19572C21.6667 8.62467 21.384 7.41757 20.4649 6.49959C19.5458 5.5816 18.3384 5.30036 17.768 5.8714C17.1977 6.44245 17.4804 7.64955 18.3994 8.56753Z"
        fill="#FF385C"
      />
      <path
        d="M17.6453 5.74764C17.7581 5.653 17.8675 5.53932 17.9976 5.4534C18.1243 5.34844 18.2613 5.25736 18.4191 5.15081C18.5006 5.101 18.5821 5.05119 18.6705 4.99622C18.752 4.94642 18.8526 4.89323 18.9444 4.8573C19.0362 4.82137 19.1419 4.77512 19.2337 4.73919C19.3306 4.7102 19.4415 4.6709 19.5436 4.64885C19.6457 4.6268 19.753 4.61169 19.8534 4.60173C19.9537 4.59178 20.0592 4.58877 20.156 4.60301C20.2528 4.61726 20.3496 4.6315 20.4394 4.6509C20.5344 4.67724 20.6225 4.70875 20.7036 4.74541C21.0384 4.90592 21.3037 5.16127 21.4718 5.48883C21.6399 5.81639 21.6987 6.2144 21.7318 6.57771C21.751 6.95134 21.7564 7.29205 21.7914 7.60003C21.8316 7.91495 21.9065 8.20407 21.9516 8.56916C21.9682 8.75082 21.9881 8.95151 21.9612 9.17622C21.9412 9.39577 21.8676 9.64449 21.7524 9.88093C21.7193 9.93786 21.6862 9.99479 21.6462 10.0569C21.6061 10.119 21.5679 10.169 21.5227 10.2241C21.4775 10.2793 21.4271 10.3275 21.3819 10.3826C21.3316 10.4308 21.2761 10.4721 21.2257 10.5203C21.1129 10.6149 20.9985 10.6785 20.8771 10.7471C20.8165 10.7814 20.7576 10.8037 20.6917 10.8311C20.6329 10.8533 20.567 10.8807 20.5081 10.9029C20.3852 10.9405 20.264 10.9659 20.1428 10.9913C20.0235 11.0046 19.9041 11.018 19.7934 11.014C19.6828 11.0101 19.5652 11.0114 19.4563 10.9953C19.3525 10.9862 19.2367 10.9754 19.1348 10.9542C18.7183 10.8867 18.3279 10.7675 17.9828 10.5931C17.6377 10.4187 17.3256 10.1874 17.083 9.90444C16.9625 9.75693 16.8473 9.61636 16.7546 9.44822C16.7048 9.36673 16.6619 9.28008 16.619 9.19343C16.5762 9.10678 16.5333 9.02013 16.5095 8.9301C16.3848 8.55948 16.3815 8.1202 16.487 7.69695C16.5151 7.58985 16.5502 7.47758 16.5886 7.38436C16.6219 7.28419 16.6742 7.18065 16.7127 7.08743C16.7581 6.98905 16.8086 6.8976 16.8591 6.80616C16.9097 6.71471 16.9654 6.63021 17.0141 6.55086C17.2266 6.19896 17.4351 5.95773 17.6453 5.74764ZM17.8933 5.99426C17.8255 6.07698 17.787 6.17021 17.7952 6.28265C17.7982 6.38816 17.8566 6.49562 17.9357 6.58762C17.9512 6.60843 17.9839 6.63797 18.0064 6.65363C18.0339 6.67623 18.0564 6.69189 18.0839 6.71449C18.146 6.75453 18.2029 6.78763 18.2668 6.81557C18.3307 6.84351 18.3946 6.87145 18.4602 6.88729C18.531 6.91007 18.5967 6.92591 18.6623 6.94175C18.9267 6.99302 19.1583 7.01475 19.3051 7.06725C19.3396 7.08469 19.3811 7.09697 19.4104 7.10747C19.4277 7.11619 19.4449 7.12491 19.4622 7.13363C19.4795 7.14235 19.4967 7.15107 19.514 7.15979C19.5709 7.19289 19.6399 7.22777 19.6899 7.26603C19.802 7.34433 19.8881 7.43116 19.9603 7.52831C20.0377 7.6324 20.1012 7.74681 20.1631 7.83008L20.2096 7.89253C20.225 7.91335 20.2353 7.92723 20.2439 7.9532C20.2542 7.96708 20.2473 7.97224 20.2576 7.98612L20.2713 8.01904L20.2899 8.10213C20.2882 8.11423 20.2915 8.13327 20.2898 8.14536C20.2931 8.1644 20.2965 8.18344 20.2947 8.19554C20.2981 8.21457 20.2963 8.22667 20.3049 8.25265C20.3083 8.27168 20.3065 8.28379 20.315 8.30976C20.3337 8.39285 20.3541 8.46384 20.4127 8.52807C20.4609 8.57843 20.5472 8.62203 20.6112 8.60674C20.6925 8.60016 20.7447 8.53986 20.7916 8.47261C20.8753 8.32423 20.8571 8.11144 20.7333 7.9449C20.7024 7.90326 20.6645 7.86678 20.6266 7.83031C20.5818 7.79899 20.5318 7.76073 20.48 7.73457C20.3713 7.67531 20.2539 7.63331 20.1208 7.61372C19.8755 7.55908 19.6091 7.56314 19.4225 7.52949C19.2289 7.50101 19.1081 7.43997 19.0153 7.31506C18.9276 7.19709 18.8956 6.99462 18.8274 6.74357C18.8121 6.67951 18.7969 6.61547 18.7695 6.54963C18.749 6.47864 18.7198 6.42491 18.6924 6.35907C18.665 6.29324 18.6359 6.23951 18.5894 6.17705C18.5688 6.1493 18.5533 6.12848 18.5327 6.10072C18.5121 6.07296 18.4845 6.05036 18.469 6.02955C18.376 5.94787 18.2603 5.89377 18.1548 5.89678C18.0598 5.87044 17.9662 5.91847 17.8933 5.99426Z"
        fill="#FF385C"
      />
      <path
        d="M32.0485 8.0155C31.619 6.57873 30.9259 5.51712 30.5004 5.64433C30.0748 5.77153 30.078 7.03938 30.5075 8.47614C30.937 9.91291 31.6301 10.9745 32.0557 10.8473C32.4812 10.7201 32.478 9.45226 32.0485 8.0155Z"
        fill="#FF385C"
      />
      <path
        d="M32.1071 11.0215C32.0069 11.0535 31.9005 11.0427 31.81 11.0208C31.7194 10.999 31.646 10.9747 31.5714 10.9418C31.4233 10.8846 31.274 10.8188 31.1088 10.7641L30.8604 10.6778C30.7686 10.6474 30.6867 10.6243 30.5936 10.5853C30.4187 10.5233 30.2424 10.4527 30.0735 10.3723C29.7443 10.2103 29.47 10.0053 29.3191 9.74758C29.1597 9.49108 29.1004 9.2026 29.1255 8.89317C29.1506 8.58374 29.2784 8.25944 29.3916 7.95474C29.4245 7.88009 29.4561 7.79688 29.4804 7.72346C29.5133 7.6488 29.5376 7.57539 29.562 7.50197C29.6106 7.35514 29.6434 7.21934 29.6578 7.07747C29.6964 6.80103 29.658 6.53574 29.6219 6.22642C29.6108 6.1494 29.5984 6.06384 29.5946 5.97702C29.5822 5.89144 29.5844 5.78627 29.5855 5.67255C29.5903 5.64564 29.5853 5.61141 29.5987 5.58325C29.6023 5.54779 29.6072 5.52087 29.6194 5.48416C29.6315 5.44745 29.6351 5.41198 29.6473 5.37528C29.6594 5.33857 29.6789 5.29206 29.6996 5.25411C29.7398 5.16966 29.7959 5.07418 29.8874 4.9823C29.9253 4.94187 29.9875 4.88917 30.0425 4.84627C30.0974 4.80337 30.1707 4.76654 30.2367 4.73952C30.3027 4.71249 30.3773 4.68423 30.453 4.66452C30.5203 4.64605 30.6058 4.63367 30.667 4.63355C30.8051 4.62229 30.9372 4.62939 31.0449 4.64875C31.2687 4.68625 31.4254 4.74221 31.5649 4.80064L31.6199 4.81889L31.6664 4.83836L31.7594 4.87733C31.8157 4.90413 31.872 4.93092 31.9198 4.95896L31.9957 5.00039L32.063 5.04307C32.1108 5.0711 32.1499 5.10039 32.1977 5.12842C32.5368 5.35891 32.7489 5.61654 32.9609 5.87416C33.1631 6.12447 33.3568 6.37603 33.5089 6.64233C33.6611 6.90863 33.7717 7.18968 33.8309 7.47816C33.8605 7.6224 33.8828 7.77644 33.8867 7.92439C33.8907 8.07235 33.9044 8.22763 33.8839 8.38786C33.8503 8.69853 33.7066 9.03386 33.4993 9.35219C33.4006 9.51501 33.2834 9.67175 33.1651 9.81993C33.1066 9.8983 33.0468 9.96812 32.987 10.0379L32.826 10.2535C32.7149 10.3918 32.6296 10.5265 32.5259 10.6551C32.4746 10.7237 32.4234 10.7923 32.3624 10.8535C32.294 10.9246 32.2073 10.9895 32.1071 11.0215ZM32.0062 10.6866C32.0392 10.6731 32.0721 10.5985 32.0487 10.497C32.0338 10.3943 31.9822 10.2795 31.8977 10.1781C31.8548 10.1232 31.8033 10.0695 31.7531 10.0243C31.6931 9.97185 31.6416 9.91814 31.5828 9.87422C31.464 9.77784 31.3281 9.68394 31.202 9.59735C30.9498 9.42417 30.7257 9.26439 30.5872 9.09222C30.5137 9.00676 30.4658 8.91759 30.4094 8.82965C30.3615 8.74047 30.3137 8.65128 30.2744 8.56087C30.1958 8.38003 30.1416 8.18692 30.1131 7.99009C30.0846 7.79326 30.0733 7.59396 30.046 7.4057L30.0076 7.14041C29.9952 7.05483 30.0012 6.97533 30.0072 6.89584C30.0132 6.87748 30.0108 6.86037 30.0254 6.84078L30.0302 6.81386L30.0449 6.79427C30.051 6.77592 30.0668 6.76488 30.0729 6.74653C30.0802 6.73673 30.0888 6.73549 30.0961 6.72569L30.1034 6.7159L30.1206 6.71342C30.1609 6.69011 30.2122 6.68268 30.3161 6.67637C30.3675 6.66894 30.4286 6.66883 30.5142 6.65644C30.5912 6.64529 30.6829 6.61455 30.7635 6.56793C30.8441 6.52131 30.9064 6.46862 30.9503 6.40984C30.9857 6.3523 31.0051 6.30579 31.0087 6.27032C31.0063 6.25321 31.0123 6.23485 31.0026 6.22754C31.0013 6.21898 30.9903 6.2031 30.989 6.19454C30.9792 6.18722 30.9597 6.17259 30.9425 6.17507C30.9071 6.17147 30.8753 6.19353 30.8362 6.22539C30.8057 6.25602 30.7765 6.29521 30.757 6.34172C30.7095 6.43597 30.6889 6.53506 30.6878 6.64879C30.6856 6.75395 30.7017 6.8652 30.7435 6.97273C30.827 7.1878 31.0133 7.388 31.2398 7.56489C31.4578 7.74302 31.7076 7.89909 31.8717 8.06754C32.0445 8.23475 32.1316 8.41435 32.1614 8.61974C32.1762 8.72243 32.1667 8.83739 32.14 8.95483C32.1315 9.01721 32.106 9.08207 32.089 9.14569C32.072 9.20931 32.0464 9.27417 32.0221 9.34759C31.9722 9.48586 31.915 9.63393 31.8664 9.78076C31.842 9.85418 31.8263 9.92636 31.802 9.99978C31.7862 10.072 31.779 10.1429 31.7718 10.2138C31.7647 10.3459 31.7833 10.4743 31.8311 10.5635C31.8973 10.6587 31.9745 10.7087 32.0062 10.6866Z"
        fill="#FF385C"
      />
      <path
        d="M24.4246 6.05954C23.8525 7.972 23.9748 9.69763 24.6977 9.91385C25.4206 10.1301 26.4703 8.75501 27.0424 6.84256C27.6144 4.93011 27.4921 3.20448 26.7692 2.98825C26.0463 2.77203 24.9966 4.14709 24.4246 6.05954Z"
        fill="#FF385C"
      />
      <path
        d="M26.8181 2.83084C27.0393 2.90603 27.2026 3.05415 27.3468 3.2056C27.4886 3.36533 27.6113 3.52839 27.7481 3.70469C27.8766 3.87851 28.0192 4.06557 28.1428 4.25596C28.2746 4.44883 28.3932 4.65578 28.4952 4.85779C28.7051 5.27255 28.8115 5.70149 28.7886 6.10982C28.7658 6.51815 28.641 6.90503 28.4218 7.2456C28.2001 7.59446 27.8865 7.88874 27.567 8.17225C27.25 8.44748 26.9438 8.7169 26.7039 9.00614C26.4556 9.29291 26.2629 9.6053 26.0081 9.94425C25.8766 10.1125 25.7401 10.2973 25.5216 10.4846L25.428 10.556C25.3933 10.5817 25.361 10.5991 25.3262 10.6248C25.2939 10.6422 25.2509 10.6654 25.2078 10.6886C25.1648 10.7119 25.1242 10.7268 25.0754 10.7393C24.894 10.8024 24.6655 10.8423 24.4128 10.8119C24.1685 10.7839 23.9357 10.6872 23.7459 10.5673C23.5562 10.4473 23.4012 10.3017 23.2851 10.1767C23.0414 9.90526 22.8913 9.65278 22.7768 9.40192C22.5453 8.90849 22.482 8.45633 22.4328 8.01742C22.3835 7.5785 22.3675 7.1495 22.4011 6.73536C22.4347 6.32122 22.5122 5.91119 22.6535 5.52927C22.7948 5.14734 22.9859 4.78029 23.2324 4.43886C23.3639 4.27062 23.5096 4.11563 23.6801 3.96806C23.7653 3.89428 23.8564 3.83127 23.9582 3.76244C24.0492 3.69942 24.1569 3.64136 24.2562 3.58082C24.6676 3.3519 25.1247 3.18174 25.5411 3.02652C25.7523 2.95429 25.9551 2.87959 26.1588 2.83221C26.3625 2.78484 26.5969 2.75566 26.8181 2.83084ZM26.719 3.16221C26.6088 3.13828 26.4763 3.18891 26.3837 3.28755C26.2885 3.39447 26.219 3.53615 26.1885 3.6985C26.1497 3.85838 26.1474 4.04722 26.1583 4.22197C26.1667 4.40499 26.1942 4.5847 26.23 4.76687C26.2849 5.12628 26.3415 5.45006 26.326 5.74327C26.3195 5.88573 26.294 6.03151 26.2792 6.1715C26.2561 6.309 26.2413 6.44898 26.2099 6.584C26.1555 6.85653 26.0762 7.12163 25.9828 7.37348C25.887 7.63362 25.7936 7.88547 25.7192 8.134C25.6821 8.25826 25.6557 8.37672 25.6234 8.48442C25.5912 8.59211 25.559 8.69981 25.5152 8.78598C25.4945 8.82492 25.4714 8.87215 25.4449 8.90033C25.4159 8.9368 25.3919 8.95669 25.3514 8.97163C25.3191 8.98905 25.2669 8.98246 25.2039 8.98169C25.141 8.98091 25.0532 8.9727 24.9745 8.9943C24.8984 9.00761 24.8396 9.05321 24.8272 9.09463C24.8148 9.13605 24.8322 9.16834 24.8737 9.18073C24.954 9.2138 25.0898 9.18221 25.2107 9.11006C25.3291 9.04619 25.4408 8.94423 25.5384 8.82902C25.6361 8.71382 25.7138 8.57462 25.7667 8.42798C25.8196 8.28134 25.8501 8.11899 25.8557 7.9492C25.8615 7.86968 25.8614 7.77941 25.853 7.68665C25.8505 7.60466 25.8421 7.51191 25.823 7.42496C25.7739 7.07632 25.6808 6.72358 25.6632 6.42046C25.6397 6.10659 25.6776 5.8291 25.7759 5.56068C25.8743 5.29225 26.0662 5.0428 26.3012 4.77013C26.4229 4.63503 26.5362 4.49745 26.6438 4.34911C26.7513 4.20078 26.8423 4.04748 26.9001 3.88427C26.9555 3.72935 26.9777 3.56452 26.9461 3.42871C26.9121 3.3012 26.8292 3.18614 26.719 3.16221Z"
        fill="#FF385C"
      />
      <path
        d="M36.5122 9.51273C37.4735 9.69824 38.3099 9.55213 38.3805 9.18639C38.4511 8.82065 37.7291 8.37377 36.7678 8.18826C35.8066 8.00274 34.9701 8.14885 34.8995 8.51459C34.829 8.88033 35.551 9.32721 36.5122 9.51273Z"
        fill="#FF385C"
      />
      <path
        d="M34.7307 8.48184C34.767 8.33915 34.8409 8.23012 34.9047 8.12794C34.9786 8.01891 35.0508 7.91836 35.1279 7.79235C35.1649 7.73784 35.2051 7.66634 35.2522 7.60497C35.2908 7.54197 35.3395 7.47211 35.3882 7.40225C35.4352 7.34088 35.484 7.27103 35.531 7.20966C35.5781 7.14829 35.6353 7.08007 35.6908 7.02035C35.7464 6.96062 35.8003 6.90938 35.8542 6.85814C35.9167 6.80854 35.9689 6.76579 36.0281 6.73317C36.148 6.65944 36.2613 6.61967 36.3799 6.59852C36.6154 6.56471 36.8413 6.62593 37.0323 6.77727C37.2233 6.9286 37.3877 7.17169 37.5267 7.40987C37.6656 7.64804 37.801 7.85911 37.9495 8.00225C38.1065 8.14703 38.2851 8.22553 38.513 8.32235C38.6338 8.38089 38.7647 8.43258 38.9234 8.56887L38.9847 8.61594C39.0069 8.63783 39.0291 8.65973 39.0412 8.68848C39.0634 8.71037 39.0839 8.74076 39.1061 8.76266L39.1335 8.80317C39.1387 8.82179 39.1541 8.83356 39.1593 8.85217C39.1988 8.92144 39.2281 8.99755 39.2558 9.08216C39.2734 9.17361 39.2893 9.27356 39.2968 9.37187C39.2957 9.46854 39.2846 9.57206 39.2649 9.67394C39.2469 9.76733 39.2119 9.85745 39.1769 9.94756L39.1468 10.0122L39.1183 10.0684C39.1033 10.1007 39.0781 10.1399 39.0546 10.1705C39.031 10.2012 39.0059 10.2404 38.9823 10.2711C38.9588 10.3018 38.9454 10.3256 38.9219 10.3563C38.7369 10.5848 38.5986 10.7078 38.4333 10.8344C38.1347 11.0586 37.8622 11.1469 37.5999 11.2284C37.3461 11.3115 37.0972 11.3691 36.8532 11.4013C36.6109 11.425 36.3682 11.4046 36.1423 11.3434C36.0267 11.3034 35.9196 11.2652 35.8158 11.2099C35.712 11.1546 35.6013 11.0892 35.5109 11.0101C35.3131 10.8487 35.1535 10.5801 35.0463 10.2688C35.017 10.1927 34.9893 10.1081 34.97 10.0251C34.9508 9.94216 34.9231 9.85756 34.9108 9.78472C34.8915 9.70175 34.8723 9.61879 34.86 9.54595C34.8391 9.47148 34.8284 9.39015 34.8144 9.3258L34.7353 8.91425C34.7223 8.75323 34.696 8.61605 34.7307 8.48184ZM35.0703 8.54738C35.0739 8.57449 35.1114 8.60816 35.1708 8.61963C35.2303 8.6311 35.3286 8.62365 35.4249 8.5806C35.4521 8.57703 35.4723 8.56333 35.5011 8.55126C35.5298 8.5392 35.5501 8.52549 35.5788 8.51343C35.638 8.48081 35.6886 8.44655 35.7392 8.41229C35.7899 8.37803 35.8422 8.33529 35.8945 8.29254C35.9467 8.24979 35.999 8.20704 36.0428 8.16265C36.2333 7.99687 36.3951 7.84316 36.5218 7.77956C36.5895 7.74857 36.6368 7.7313 36.7012 7.7173C36.757 7.70166 36.8112 7.69451 36.8655 7.68736C37.0722 7.66561 37.253 7.8238 37.4149 7.94311L37.4678 7.98854C37.4832 8.00031 37.4985 8.01208 37.5122 8.03233C37.5259 8.05259 37.5328 8.06272 37.5448 8.09147C37.5585 8.11172 37.5536 8.1372 37.5657 8.16594C37.5627 8.22701 37.5751 8.29985 37.525 8.42229C37.5217 8.43927 37.5185 8.45625 37.5168 8.46474C37.5135 8.48172 37.5001 8.50555 37.4969 8.52253C37.4936 8.53951 37.4802 8.56334 37.4769 8.58032C37.4753 8.58881 37.4736 8.5973 37.4703 8.61429L37.4537 8.6551C37.4337 8.71289 37.434 8.75698 37.431 8.81805C37.4196 8.87748 37.4251 8.94019 37.4407 8.99605C37.4479 9.05026 37.4635 9.10612 37.4893 9.15513C37.5082 9.194 37.5356 9.23452 37.5646 9.26654C37.5715 9.27667 37.58 9.27831 37.5868 9.28844L37.6022 9.30021C37.609 9.31033 37.626 9.31361 37.6345 9.31525C37.643 9.31689 37.6583 9.32866 37.6668 9.33029C37.6753 9.33193 37.6854 9.32508 37.6939 9.32672C37.7125 9.32151 37.7295 9.32478 37.7413 9.30944C37.7514 9.30259 37.7547 9.28561 37.7648 9.27876C37.7749 9.27191 37.7697 9.25329 37.773 9.23631C37.7763 9.21933 37.7694 9.2092 37.7727 9.19222C37.7606 9.16347 37.7571 9.13636 37.7349 9.11446C37.7127 9.09257 37.6905 9.07067 37.6683 9.04878C37.6445 9.03537 37.6138 9.01184 37.5798 9.00528C37.5459 8.99873 37.5119 8.99217 37.4779 8.98562C37.3287 8.98324 37.1428 9.07946 36.9588 9.21128C36.7834 9.34473 36.6099 9.51379 36.4798 9.59437C36.3397 9.68181 36.2312 9.6961 36.1274 9.64084C36.1036 9.62744 36.0814 9.60554 36.0507 9.58201C36.0216 9.54998 36.0011 9.5196 35.972 9.48757C35.943 9.45555 35.9172 9.40654 35.8915 9.35754L35.8057 9.20888C35.7799 9.15988 35.7473 9.10074 35.7147 9.04161C35.682 8.98248 35.6478 8.93183 35.6135 8.88119C35.5793 8.83054 35.545 8.7799 35.5023 8.72762C35.4664 8.68547 35.422 8.64167 35.3844 8.60801C35.3094 8.54068 35.2209 8.49719 35.1598 8.49421C35.1157 8.49451 35.0667 8.52028 35.0703 8.54738Z"
        fill="#FF385C"
      />
      <path
        d="M23.6838 10.0545C23.5675 10.6044 24.8541 7.91276 24.7028 8.4358C24.5515 8.95884 26.9024 7.72542 26.7317 8.22925C26.3941 9.24849 25.5862 11.6745 22.2888 16.162C21.3537 18.0629 20.1643 20.0893 19.4302 21.9734C19.065 22.9117 18.7115 23.8459 18.4273 24.7565C18.2911 25.2099 18.1586 25.6554 18.0725 26.0852C17.9786 26.5112 17.931 26.9214 17.9292 27.2386C17.9302 27.3932 17.9388 27.5324 17.955 27.6367C17.9669 27.6908 17.9749 27.7332 17.9907 27.7796C17.9946 27.7911 18.0063 27.8065 18.018 27.8219C18.0297 27.8373 18.0376 27.8605 18.0416 27.872C18.065 27.9028 18.0845 27.9414 18.1079 27.9721C18.2798 28.2301 18.5791 28.4641 18.9824 28.6432C19.378 28.8185 19.8583 28.9391 20.3653 29.0054C20.8723 29.0718 21.4139 29.1069 21.9708 29.111C21.5323 29.4735 21.0314 29.7475 20.4837 29.9598C19.9359 30.1722 19.349 30.3075 18.6916 30.3118C18.3629 30.3139 18.0262 30.2736 17.6853 30.183C17.3445 30.0924 16.9916 29.9477 16.6731 29.7333C16.5916 29.6835 16.5139 29.626 16.4362 29.5685C16.4012 29.5417 16.3584 29.511 16.3235 29.4842C16.2807 29.4535 16.2535 29.4305 16.2106 29.3805C16.0434 29.2308 15.8991 29.0538 15.782 28.8806C15.536 28.5186 15.379 28.1523 15.2683 27.7895C15.0548 27.0678 15.0273 26.3989 15.0386 25.7685C15.0482 25.4552 15.0733 25.1496 15.1061 24.8477C15.139 24.5459 15.1873 24.2517 15.2396 23.969C15.4603 22.8152 15.8052 21.7418 16.2084 20.7067C16.6116 19.6715 17.0885 18.6823 17.612 17.716C18.1317 16.7575 23.6505 7.90853 24.2634 7.01512C24.8763 6.12171 23.3497 9.0904 24.0636 8.26594C24.4206 7.85371 23.29 9.42722 23.682 9.04183C24.0585 8.66814 23.2336 10.4016 23.6838 10.0545Z"
        fill="#FF385C"
      />
    </CommonIcon>
  );
};
