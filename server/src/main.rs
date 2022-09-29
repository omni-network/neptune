use clap::Parser;
use neptune::app::{App, Config};
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let cfg = Config::parse();

    let mut app = App::new(cfg).await;
    app.run().await
}
