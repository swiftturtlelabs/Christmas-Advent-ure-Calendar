import type { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
}

/** Desktop/tablet: phone bezel with mobile layout inside. Real phones: unframed. */
export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="phone-stage">
      <div className="phone-frame" aria-label="Phone preview">
        <div className="phone-frame__bezel">
          <div className="phone-frame__island" aria-hidden="true" />
          <div className="phone-frame__screen">{children}</div>
          <div className="phone-frame__home" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
