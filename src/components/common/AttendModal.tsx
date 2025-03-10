import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useOutsideClick } from '@/common/hooks/useOutsideClick';
import { push, ref } from 'firebase/database';
import { realtimeDb } from '@/components/common/firebase';

interface Props {
  setComponent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
}

const AttendModal = ({ setComponent }: Props) => {
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isGroom, setIsGroom] = useState<boolean>(true);
  const [name, setName] = useState<string>();
  const [companionCount, setCompanionCount] = useState<string>('0');
  const [eatDinner, setEatDinner] = useState<boolean>();
  // const [isAgreed, setIsAgreed] = useState<boolean>(false);

  const elRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: elRef,
    handler: () => setComponent(null),
  });

  const isAvailableHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const _isAvailable = e.target.value === 'true';

    console.log(_isAvailable);
    setIsAvailable(_isAvailable);
  };

  const isGroomHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const _isGroom = e.target.value === 'true';

    console.log(_isGroom);
    setIsGroom(_isGroom);
  };

  const companionCountHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    setCompanionCount(e.target.value);
  };

  // const isAgreedHandler = (e: ChangeEvent<HTMLInputElement>) => {
  //   const { checked } = e.target;
  //   setIsAgreed(checked);
  // };

  const eatDinnerHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const _eatDinner = e.target.value === 'true';
    setEatDinner(_eatDinner);
  };

  const postAttendInfo = async () => {
    const inputData = {
      name,
      isAvailable,
      isGroom,
      companionCount: isAvailable ? companionCount : 0,
      eatDinner: isAvailable ? eatDinner : false,
      created_at: new Date().toISOString(),
    };

    const res = await push(ref(realtimeDb, '/attend'), inputData);
    return res;
  };

  const onSubmit = async () => {
    if (!name?.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    if (isAvailable && eatDinner === undefined) {
      alert('식사 여부를 선택해주세요.');
      return;
    }

    try {
      const res = await postAttendInfo();
      console.log(res);
      alert('참석 정보가 전달되었습니다.');
    } catch (err) {
      console.error(err);
      alert('에러가 발생하였습니다.');
    } finally {
      setComponent(null);
    }
  };

  return (
    <Container ref={elRef}>
      <CloseButton onClick={() => setComponent(null)}>
        <i
          className="fa fa-times"
          style={{ color: 'white' }}
          aria-hidden="true"
        ></i>
      </CloseButton>
      <Title>참석 여부 전달하기</Title>
      <Wrapper>
        <SubTitle>참석 여부를 선택해주세요.</SubTitle>
        <ButtonWrapper>
          <Button>
            <Input
              id="radio-1"
              type="radio"
              name="isAvailable"
              value="true"
              onChange={isAvailableHandler}
              checked={isAvailable}
            />
            <Label htmlFor="radio-1">
              <i className="fa fa-check" style={{ marginRight: '4px' }} />
              참석 가능
            </Label>
          </Button>
          <Button>
            <Input
              id="radio-2"
              type="radio"
              name="isAvailable"
              value="false"
              onChange={isAvailableHandler}
              checked={!isAvailable}
            />
            <Label htmlFor="radio-2">
              <span
                className="no"
                style={{
                  fontFamily: 'Pretendard',
                  fontWeight: 700,
                  fontSize: '17px',
                  marginRight: '4px',
                }}
              >
                X
              </span>
              참석 불가
            </Label>
          </Button>
        </ButtonWrapper>
      </Wrapper>

      <Wrapper style={{ marginTop: '28px' }}>
        <SubTitle>신랑 & 신부에게 전달될 정보를 입력해주세요.</SubTitle>
        <ButtonWrapper>
          <Button>
            <Input
              className="isGroom"
              id="radio-3"
              type="radio"
              name="isGroom"
              value="true"
              onChange={isGroomHandler}
              checked={isGroom}
            />
            <Label htmlFor="radio-3">신랑측</Label>
          </Button>
          <Button>
            <Input
              className="isBride"
              id="radio-4"
              type="radio"
              name="isGroom"
              value="false"
              onChange={isGroomHandler}
              checked={!isGroom}
            />
            <Label htmlFor="radio-4">신부측</Label>
          </Button>
        </ButtonWrapper>
      </Wrapper>
      <InputContentWrapper>
        <InputContent>
          <InputContentLabel htmlFor="name">
            성함<Dot>*</Dot>
          </InputContentLabel>
          <TextInput
            id="name"
            type="text"
            spellCheck={false}
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></TextInput>
        </InputContent>

        {isAvailable && (
          <>
            <InputContent>
              <InputContentLabel htmlFor="companionCount">
                추가 인원<Dot>*</Dot>
              </InputContentLabel>

              <Select
                id="companionCount"
                value={companionCount}
                onChange={companionCountHandler}
              >
                <option value="0">동행인 없음</option>
                <option value="1">외 1명</option>
                <option value="2">외 2명</option>
                <option value="3">외 3명</option>
              </Select>
            </InputContent>
            <InputContent
              style={{
                border: 'none',
                paddingTop: '10px',
              }}
            >
              <InputContentLabel
                htmlFor="companionCount"
                style={{ position: 'relative', bottom: '9px' }}
              >
              식사여부<Dot>*</Dot>
              </InputContentLabel>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  flex: 1,
                  maxWidth: '300px',
                  marginLeft: '8px',
                  position: 'relative',
                  top: '2px',
                }}
              >
                <button style={{ width: '33%' }}>
                  <Input
                    id="radio-5"
                    className="eatDinner"
                    type="radio"
                    name="eatDinner"
                    value="true"
                    onChange={eatDinnerHandler}
                    checked={eatDinner === true}
                  />
                  <Label
                    htmlFor="radio-5"
                    style={{
                      fontWeight: 400,
                      height: 41,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    예정
                  </Label>
                </button>
                <button style={{ width: '33%' }}>
                  <Input
                    id="radio-6"
                    className="eatDinner"
                    type="radio"
                    name="eatDinner"
                    value="false"
                    onChange={eatDinnerHandler}
                    checked={eatDinner === false}
                  />
                  <Label
                    htmlFor="radio-6"
                    style={{
                      fontWeight: 400,
                      height: 41,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    안함
                  </Label>
                </button>
                <button style={{ width: '33%' }}>
                  <Input
                    id="radio-7"
                    className="eatDinner"
                    type="radio"
                    name="eatDinner"
                    value="na"
                    onChange={eatDinnerHandler}
                    checked={eatDinner === false}
                  />
                  <Label
                    htmlFor="radio-7"
                    style={{
                      fontWeight: 400,
                      height: 41,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    미정
                  </Label>
                </button>
              </div>
            </InputContent>
          </>
        )}
      </InputContentWrapper>
      <SubmitButton onClick={onSubmit}>참석정보 전달하기</SubmitButton>
    </Container>
  );
};

export default AttendModal;

const InputContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin: 28px 0;

  @media only screen and (max-width: 445px) {
    gap: 11px;
  }

  @media only screen and (max-width: 360px) {
    gap: 10px;
  }
`;

const InputContent = styled.div`
  width: 100%;
  border-bottom: 1px solid #e3e3e3;
  display: flex;
  height: 52px;
  font-size: 16px;
  position: relative;
  justify-content: space-between;

  @media only screen and (max-width: 445px) {
    font-size: 15.5px;
    height: 50px;
  }

  @media only screen and (max-width: 400px) {
    font-size: 15px;
    height: 48px;
  }
`;

const Dot = styled.span`
  font-family: Pretendard;
  color: #f47269;
  font-weight: 600;
  position: relative;
  left: 4px;
`;

const InputContentLabel = styled.label`
  font-family: Pretendard;
  white-space: nowrap;
  font-weight: 600;
  width: 100px;
  min-width: 100px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const TextInput = styled.input`
  font-family: Pretendard;
  flex: 1;
  outline: none;
  font-size: 16px;
  font-weight: 500;
  padding-left: 4px;
  background-color: transparent;
  max-width: 300px;

  &::placeholder,
  &::-webkit-input-placeholder {
    color: #bdbdbd;
  }
  &::-ms-input-placeholder {
    color: #bdbdbd;
  }
`;

const Select = styled.select`
  font-family: Pretendard;
  flex: 1;
  outline: none;
  padding-left: 4px;
  font-weight: 500;
  background-color: transparent;
  position: relative;
  max-width: 300px;
`;

const Container = styled.div`
  position: relative;
  background-color: white;
  width: min(calc(100vw - 20px), 500px);
  max-height: calc(100vh - 24px);
  display: flex;
  /* justify-content: center; */
  overflow-y: auto;
  overflow-x: hidden;
  align-items: center;
  position: relative;
  animation: fadeInUp 0.3s ease-in-out;
  flex-direction: column;
  padding: 32px 35px;

  @media only screen and (max-width: 445px) {
    padding: 28px 26px;
  }

  @media only screen and (max-width: 360px) {
    padding: 24px 20px;
  }
`;

const Title = styled.div`
  width: 100%;
  color: #444444;
  border-bottom: 1px solid #e3e3e3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 22px;
  padding-bottom: 25px;
  margin-bottom: 33px;
  font-family: Pretendard;

  @media only screen and (max-width: 600px) {
    font-size: 21px;
    padding-bottom: 24px;
    margin-bottom: 32px;
  }

  @media only screen and (max-width: 445px) {
    font-size: 20px;
    padding-bottom: 23px;
    margin-bottom: 31px;
  }

  @media only screen and (max-width: 360px) {
    font-size: 19px;
    padding-bottom: 22px;
    margin-bottom: 30px;
  }
`;

const SubTitle = styled.p`
  font-family: Pretendard;
  color: #444444;
  font-weight: 600;
  font-size: 18px;
  text-align: left;
  white-space: nowrap;

  @media only screen and (max-width: 600px) {
    font-size: 17px;
  }

  @media only screen and (max-width: 445px) {
    font-size: 16px;
  }

  @media only screen and (max-width: 360px) {
    font-size: 15.5px;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;

  @media only screen and (max-width: 445px) {
    gap: 18px;
  }

  @media only screen and (max-width: 360px) {
    gap: 16px;
  }
`;

const ButtonWrapper = styled.div`
  width: 100%;
  height: 50px;

  display: flex;

  @media only screen and (max-width: 445px) {
    height: 49px;
  }

  @media only screen and (max-width: 360px) {
    height: 48px;
  }
`;

const Input = styled.input`
  display: none;

  /* Checked */
  &:checked + label {
    background-color: #f0eaa8;
    color: #fff;
    border: 1px solid #f0eaa8;
  }

  /* Checked */
  &:checked + label > i.fa-check {
    color: #91b193;
  }

  /* Checked */
  &:checked + label > .no {
    color: #be7e79;
  }

  /* Checked */
  &.isGroom:checked + label {
    background-color: #65778f;
    color: #fff;
    border: 1px solid #65778f;
  }

  /* Checked */
  &.isBride:checked + label {
    background-color: #be7e79;
    color: #fff;
    border: 1px solid #be7e79;
  }

  /* &.eatDinner:checked + label {
    background-color: gold;
    color: black;
    border: 1px solid #555555;
  } */
`;

const Button = styled.button`
  background-color: transparent;
  flex: 1;
  cursor: pointer;
`;

const Label = styled.label`
  border: 1px solid #e3e3e3;
  height: 50px;
  display: block;
  font-family: Pretendard;
  color: #909090;
  font-weight: 500;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  & > i,
  span {
    color: #909090;
  }

  @media only screen and (max-width: 445px) {
    height: 49px;
    font-size: 15.5px;
  }

  @media only screen and (max-width: 360px) {
    height: 48px;
    font-size: 15px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.28);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  font-size: 21px;
  display: flex;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  font-weight: 200;

  @media only screen and (max-width: 445px) {
    width: 34px;
    height: 34px;
    font-size: 20px;
  }

  @media only screen and (max-width: 360px) {
    width: 33px;
    height: 33px;
    font-size: 19px;
    top: 11px;
    right: 11px;
  }
`;

const SubmitButton = styled.button`
  margin-top: 28px;
  background-color: #f0eaa8;
  color: white;
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
  width: 100%;
  height: 58px;
  min-height: 58px;
  border-radius: 4px;

  @media only screen and (max-width: 445px) {
    height: 56px;
    min-height: 56px;
  }
`;
