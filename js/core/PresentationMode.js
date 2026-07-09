/**
 * PresentationMode
 * 'present'(기본, 화면 발표용)와 'print'(A3 PDF 출력용) 두 모드를 전환한다.
 * print 모드는 body.mode-print 클래스로 css/print.css가 전체 슬라이드를
 * 세로로 스택해서 보여주고, window.print()로 브라우저 인쇄 다이얼로그를 연다.
 */
export class PresentationMode {
  constructor({ inputController, stageScaler } = {}) {
    this.inputController = inputController;
    this.stageScaler = stageScaler;
    this.mode = 'present';
  }

  enterPrintMode() {
    this.mode = 'print';
    document.body.classList.add('mode-print');
    this.inputController?.setEnabled(false);
  }

  exitPrintMode() {
    this.mode = 'present';
    document.body.classList.remove('mode-print');
    this.inputController?.setEnabled(true);
    this.stageScaler?.refresh();
  }

  /** A3 가로 PDF로 저장: 인쇄 모드 진입 → 인쇄 다이얼로그 → 닫히면 자동 복귀 */
  printToPDF() {
    this.enterPrintMode();
    const restore = () => {
      this.exitPrintMode();
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    // 레이아웃 반영 후 인쇄 (다음 프레임)
    requestAnimationFrame(() => window.print());
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  getMode() {
    return this.mode;
  }
}
