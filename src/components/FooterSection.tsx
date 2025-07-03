
const FooterSection = () => {
  return (
    <footer className="mt-16 py-12 border-t bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-foreground mb-4">Trust & Security</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-green-600">🔒</span>
                <span>GDPR Compliant Data Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🛡️</span>
                <span>Secure SSL Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600">🗑️</span>
                <span>Automatic Data Deletion</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">AI-Powered Analysis</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>📊 Comprehensive Policy Analysis</div>
              <div>⚠️ Coverage Gap Detection</div>
              <div>💡 Personalized Insights</div>
              <div>💬 Interactive Chat Support</div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Disclaimer</h4>
            <p className="text-sm text-muted-foreground">
              This AI-powered analysis is for informational purposes only. 
              Always consult with a licensed insurance professional before making policy decisions.
            </p>
          </div>
        </div>
        <div className="text-center pt-8 border-t">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Insurance Policy Analysis. Powered by advanced AI technology.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
